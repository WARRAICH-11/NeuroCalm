interface ErrorContext {
  userId?: string
  sessionId?: string
  url?: string
  userAgent?: string
  timestamp?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
  tags?: Record<string, string>
}

interface ErrorEvent {
  message: string
  stack?: string
  context: ErrorContext
  fingerprint?: string
}

class ErrorTracker {
  private apiKey: string
  private endpoint: string
  private isEnabled: boolean

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_SENTRY_DSN || ''
    this.endpoint = process.env.NEXT_PUBLIC_SENTRY_ENDPOINT || 'https://sentry.io/api/0/projects/'
    this.isEnabled = process.env.NODE_ENV === 'production' && !!this.apiKey
  }

  private generateFingerprint(error: Error): string {
    // Simple fingerprint generation based on error message and stack
    const message = error.message || 'Unknown error'
    const stack = error.stack || ''
    return btoa(message + stack).substring(0, 32)
  }

  private async sendToSentry(event: ErrorEvent): Promise<void> {
    if (!this.isEnabled) {
      console.log('Error tracking disabled or not configured:', event)
      return
    }

    try {
      const payload = {
        message: event.message,
        level: event.context.severity || 'error',
        timestamp: event.context.timestamp || new Date().toISOString(),
        platform: 'javascript',
        server_name: 'neurocalm-app',
        tags: {
          environment: process.env.NODE_ENV,
          ...event.context.tags,
        },
        user: event.context.userId ? { id: event.context.userId } : undefined,
        extra: {
          sessionId: event.context.sessionId,
          url: event.context.url,
          userAgent: event.context.userAgent,
        },
        fingerprint: [event.fingerprint || 'default'],
        exception: {
          values: [
            {
              type: 'Error',
              value: event.message,
              stacktrace: event.stack ? {
                frames: event.stack.split('\n').map((line, index) => ({
                  filename: 'app.js',
                  function: 'unknown',
                  lineno: index + 1,
                  colno: 0,
                  context_line: line.trim(),
                })),
              } : undefined,
            },
          ],
        },
      }

      await fetch(`${this.endpoint}/store/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      })
    } catch (error) {
      console.error('Failed to send error to Sentry:', error)
    }
  }

  async captureError(
    error: Error,
    context: Partial<ErrorContext> = {}
  ): Promise<void> {
    const event: ErrorEvent = {
      message: error.message,
      stack: error.stack,
      context: {
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        severity: 'medium',
        ...context,
      },
      fingerprint: this.generateFingerprint(error),
    }

    await this.sendToSentry(event)
  }

  async captureMessage(
    message: string,
    context: Partial<ErrorContext> = {}
  ): Promise<void> {
    const event: ErrorEvent = {
      message,
      context: {
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        severity: 'low',
        ...context,
      },
    }

    await this.sendToSentry(event)
  }

  async captureException(
    exception: unknown,
    context: Partial<ErrorContext> = {}
  ): Promise<void> {
    if (exception instanceof Error) {
      await this.captureError(exception, context)
    } else {
      await this.captureMessage(
        `Non-Error exception: ${String(exception)}`,
        { ...context, severity: 'high' }
      )
    }
  }

  setUser(userId: string, additionalData?: Record<string, any>): void {
    // Store user context for future error tracking
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('errorTracker_userId', userId)
      if (additionalData) {
        sessionStorage.setItem('errorTracker_userData', JSON.stringify(additionalData))
      }
    }
  }

  clearUser(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('errorTracker_userId')
      sessionStorage.removeItem('errorTracker_userData')
    }
  }
}

// Singleton instance
export const errorTracker = new ErrorTracker()

// React Error Boundary integration
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    errorTracker.captureError(error, {
      tags: {
        component: 'ErrorBoundary',
        errorBoundary: 'true',
      },
      severity: 'high',
    })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error!} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
        <p className="text-gray-600 mb-4">We're sorry, but something unexpected happened.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reload Page
        </button>
      </div>
    </div>
  )
}
