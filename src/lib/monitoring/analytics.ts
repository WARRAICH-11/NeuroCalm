interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  userId?: string
  timestamp?: string
}

interface UserProperties {
  userId: string
  traits?: Record<string, any>
}

class Analytics {
  private apiKey: string
  private endpoint: string
  private isEnabled: boolean
  private userId?: string

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_ANALYTICS_API_KEY || ''
    this.endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || 'https://api.mixpanel.com/track'
    this.isEnabled = process.env.NODE_ENV === 'production' && !!this.apiKey
  }

  private async sendEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.isEnabled) {
      console.log('Analytics disabled or not configured:', event)
      return
    }

    try {
      const payload = {
        event: event.name,
        properties: {
          token: this.apiKey,
          distinct_id: event.userId || this.userId || 'anonymous',
          time: event.timestamp ? new Date(event.timestamp).getTime() : Date.now(),
          $lib: 'neurocalm-web',
          $lib_version: '1.0.0',
          ...event.properties,
        },
      }

      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
    } catch (error) {
      console.error('Failed to send analytics event:', error)
    }
  }

  identify(userId: string, traits?: Record<string, any>): void {
    this.userId = userId
    
    if (this.isEnabled) {
      // Store user identification for future events
      if (typeof window !== 'undefined') {
        localStorage.setItem('analytics_userId', userId)
        if (traits) {
          localStorage.setItem('analytics_userTraits', JSON.stringify(traits))
        }
      }
    }
  }

  track(eventName: string, properties?: Record<string, any>): void {
    this.sendEvent({
      name: eventName,
      properties,
      userId: this.userId,
    })
  }

  page(name?: string, properties?: Record<string, any>): void {
    this.track('Page Viewed', {
      page_name: name || (typeof window !== 'undefined' ? window.location.pathname : 'unknown'),
      page_url: typeof window !== 'undefined' ? window.location.href : undefined,
      ...properties,
    })
  }

  // Specific tracking methods for NeuroCalm
  trackDailyCheckin(properties: {
    mood: number
    sleep: number
    hasDiet: boolean
    hasExercise: boolean
    hasStressors: boolean
  }): void {
    this.track('Daily Check-in Completed', properties)
  }

  trackAICoachInteraction(properties: {
    questionLength: number
    responseTime?: number
    satisfaction?: number
  }): void {
    this.track('AI Coach Interaction', properties)
  }

  trackScoreGenerated(properties: {
    calmIndex: number
    productivityIndex: number
    isImprovement: boolean
  }): void {
    this.track('Score Generated', properties)
  }

  trackRecommendationViewed(properties: {
    recommendationType: 'personalized' | 'habitTools'
    recommendationCount: number
  }): void {
    this.track('Recommendation Viewed', properties)
  }

  trackUserEngagement(properties: {
    sessionDuration: number
    pagesViewed: number
    actionsCompleted: number
  }): void {
    this.track('User Engagement', properties)
  }

  trackError(properties: {
    errorType: string
    errorMessage: string
    component?: string
    severity: 'low' | 'medium' | 'high' | 'critical'
  }): void {
    this.track('Error Occurred', properties)
  }

  // Performance tracking
  trackPerformance(properties: {
    metric: string
    value: number
    unit: 'ms' | 'bytes' | 'count'
  }): void {
    this.track('Performance Metric', properties)
  }

  // Feature usage tracking
  trackFeatureUsage(properties: {
    feature: string
    action: 'viewed' | 'clicked' | 'completed' | 'abandoned'
    context?: string
  }): void {
    this.track('Feature Usage', properties)
  }
}

// Singleton instance
export const analytics = new Analytics()

// React hook for analytics
export function useAnalytics() {
  const track = (eventName: string, properties?: Record<string, any>) => {
    analytics.track(eventName, properties)
  }

  const identify = (userId: string, traits?: Record<string, any>) => {
    analytics.identify(userId, traits)
  }

  const page = (name?: string, properties?: Record<string, any>) => {
    analytics.page(name, properties)
  }

  return {
    track,
    identify,
    page,
    analytics,
  }
}

// Performance monitoring
export function trackWebVitals() {
  if (typeof window === 'undefined') return

  // Track Core Web Vitals
  const trackCLS = (metric: any) => {
    analytics.trackPerformance({
      metric: 'CLS',
      value: metric.value,
      unit: 'count',
    })
  }

  const trackFID = (metric: any) => {
    analytics.trackPerformance({
      metric: 'FID',
      value: metric.value,
      unit: 'ms',
    })
  }

  const trackFCP = (metric: any) => {
    analytics.trackPerformance({
      metric: 'FCP',
      value: metric.value,
      unit: 'ms',
    })
  }

  const trackLCP = (metric: any) => {
    analytics.trackPerformance({
      metric: 'LCP',
      value: metric.value,
      unit: 'ms',
    })
  }

  const trackTTFB = (metric: any) => {
    analytics.trackPerformance({
      metric: 'TTFB',
      value: metric.value,
      unit: 'ms',
    })
  }

  // Import and use web-vitals library if available
  if (typeof window !== 'undefined') {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(trackCLS)
      getFID(trackFID)
      getFCP(trackFCP)
      getLCP(trackLCP)
      getTTFB(trackTTFB)
    }).catch(() => {
      // web-vitals not available, skip tracking
    })
  }
}
