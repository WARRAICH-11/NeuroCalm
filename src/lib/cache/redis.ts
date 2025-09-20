interface CacheConfig {
  ttl: number // Time to live in seconds
  prefix?: string
}

interface CacheEntry<T> {
  value: T
  expires: number
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private isEnabled: boolean

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production'
  }

  private getKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() > entry.expires
  }

  set<T>(key: string, value: T, config: CacheConfig): void {
    if (!this.isEnabled) return

    const cacheKey = this.getKey(key, config.prefix)
    const entry: CacheEntry<T> = {
      value,
      expires: Date.now() + (config.ttl * 1000),
    }

    this.cache.set(cacheKey, entry)
  }

  get<T>(key: string, prefix?: string): T | null {
    if (!this.isEnabled) return null

    const cacheKey = this.getKey(key, prefix)
    const entry = this.cache.get(cacheKey)

    if (!entry || this.isExpired(entry)) {
      this.cache.delete(cacheKey)
      return null
    }

    return entry.value
  }

  delete(key: string, prefix?: string): boolean {
    if (!this.isEnabled) return false

    const cacheKey = this.getKey(key, prefix)
    return this.cache.delete(cacheKey)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean up expired entries
  cleanup(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key)
      }
    }
  }

  // Get cache statistics
  getStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track hits/misses for real implementation
    }
  }
}

// Singleton instance
export const cache = new CacheManager()

// Cache decorator for functions
export function cached<T extends (...args: any[]) => any>(
  fn: T,
  config: CacheConfig,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
    const cached = cache.get(key, config.prefix)
    
    if (cached !== null) {
      return cached
    }

    const result = fn(...args)
    
    // Handle promises
    if (result instanceof Promise) {
      return result.then((resolved) => {
        cache.set(key, resolved, config)
        return resolved
      })
    }

    cache.set(key, result, config)
    return result
  }) as T
}

// Specific cache configurations
export const cacheConfigs = {
  aiResponse: { ttl: 300, prefix: 'ai' }, // 5 minutes
  userProfile: { ttl: 1800, prefix: 'user' }, // 30 minutes
  recommendations: { ttl: 600, prefix: 'rec' }, // 10 minutes
  scores: { ttl: 900, prefix: 'scores' }, // 15 minutes
  static: { ttl: 3600, prefix: 'static' }, // 1 hour
} as const

// Cleanup expired entries every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    cache.cleanup()
  }, 5 * 60 * 1000)
}
