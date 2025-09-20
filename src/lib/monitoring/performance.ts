interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: number
  context?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private isEnabled: boolean

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production'
  }

  public addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric)
    
    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100)
    }
  }

  measurePageLoad(): void {
    if (typeof window === 'undefined' || !this.isEnabled) return

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (navigation) {
        this.addMetric({
          name: 'page_load_time',
          value: navigation.loadEventEnd - navigation.fetchStart,
          unit: 'ms',
          timestamp: Date.now(),
        })

        this.addMetric({
          name: 'dom_content_loaded',
          value: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          unit: 'ms',
          timestamp: Date.now(),
        })

        this.addMetric({
          name: 'first_byte',
          value: navigation.responseStart - navigation.fetchStart,
          unit: 'ms',
          timestamp: Date.now(),
        })
      }
    })
  }

  measureResourceTiming(): void {
    if (typeof window === 'undefined' || !this.isEnabled) return

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming
          
          this.addMetric({
            name: 'resource_load_time',
            value: resource.responseEnd - resource.requestStart,
            unit: 'ms',
            timestamp: Date.now(),
            context: {
              resourceName: resource.name,
              resourceType: this.getResourceType(resource.name),
            },
          })
        }
      }
    })

    observer.observe({ entryTypes: ['resource'] })
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript'
    if (url.includes('.css')) return 'stylesheet'
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg') || url.includes('.gif')) return 'image'
    if (url.includes('.woff') || url.includes('.woff2') || url.includes('.ttf')) return 'font'
    return 'other'
  }

  measureCustomTiming(name: string, startTime?: number): () => void {
    const start = startTime || performance.now()
    
    return () => {
      const end = performance.now()
      this.addMetric({
        name: `custom_${name}`,
        value: end - start,
        unit: 'ms',
        timestamp: Date.now(),
      })
    }
  }

  measureMemoryUsage(): void {
    if (typeof window === 'undefined' || !this.isEnabled) return

    // Check if memory API is available
    if ('memory' in performance) {
      const memory = (performance as any).memory
      
      this.addMetric({
        name: 'memory_used',
        value: memory.usedJSHeapSize,
        unit: 'bytes',
        timestamp: Date.now(),
      })

      this.addMetric({
        name: 'memory_total',
        value: memory.totalJSHeapSize,
        unit: 'bytes',
        timestamp: Date.now(),
      })
    }
  }

  measureNetworkSpeed(): void {
    if (typeof window === 'undefined' || !this.isEnabled) return

    // Check if connection API is available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      
      this.addMetric({
        name: 'connection_speed',
        value: connection.downlink || 0,
        unit: 'mbps',
        timestamp: Date.now(),
        context: {
          effectiveType: connection.effectiveType,
          rtt: connection.rtt,
        },
      })
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  clearMetrics(): void {
    this.metrics = []
  }

  // Send metrics to analytics service
  async sendMetrics(): Promise<void> {
    if (!this.isEnabled || this.metrics.length === 0) return

    try {
      // Import analytics dynamically to avoid circular dependencies
      const { analytics } = await import('./analytics')
      
      this.metrics.forEach(metric => {
        analytics.trackPerformance({
          metric: metric.name,
          value: metric.value,
          unit: metric.unit as 'ms' | 'bytes' | 'count',
        })
      })

      // Clear metrics after sending
      this.clearMetrics()
    } catch (error) {
      console.error('Failed to send performance metrics:', error)
    }
  }

  // Initialize all monitoring
  initialize(): void {
    this.measurePageLoad()
    this.measureResourceTiming()
    this.measureMemoryUsage()
    this.measureNetworkSpeed()

    // Send metrics every 30 seconds
    setInterval(() => {
      this.sendMetrics()
    }, 30000)
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const measureTiming = (name: string) => {
    return performanceMonitor.measureCustomTiming(name)
  }

  const addMetric = (name: string, value: number, unit: string, context?: Record<string, any>) => {
    performanceMonitor.addMetric({
      name,
      value,
      unit,
      timestamp: Date.now(),
      context,
    })
  }

  return {
    measureTiming,
    addMetric,
    getMetrics: () => performanceMonitor.getMetrics(),
  }
}
