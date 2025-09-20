interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
  requireInteraction?: boolean
  silent?: boolean
  actions?: NotificationAction[]
}

interface NotificationAction {
  action: string
  title: string
  icon?: string
}

class NotificationService {
  private isSupported: boolean
  private permission: NotificationPermission = 'default'

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'Notification' in window
    this.permission = this.isSupported ? Notification.permission : 'denied'
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      throw new Error('Notifications are not supported in this browser')
    }

    if (this.permission === 'granted') {
      return this.permission
    }

    this.permission = await Notification.requestPermission()
    return this.permission
  }

  async showNotification(options: NotificationOptions): Promise<void> {
    if (!this.isSupported || this.permission !== 'granted') {
      console.warn('Notifications not available or permission denied')
      return
    }

    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/icon-192x192.png',
      badge: options.badge || '/icon-192x192.png',
      tag: options.tag,
      data: options.data,
      requireInteraction: options.requireInteraction,
      silent: options.silent,
      actions: options.actions,
    })

    // Auto-close after 5 seconds unless requireInteraction is true
    if (!options.requireInteraction) {
      setTimeout(() => {
        notification.close()
      }, 5000)
    }

    return new Promise((resolve) => {
      notification.onclick = () => {
        window.focus()
        notification.close()
        resolve()
      }

      notification.onclose = () => {
        resolve()
      }
    })
  }

  // Specific notification types for NeuroCalm
  async showDailyReminder(): Promise<void> {
    await this.showNotification({
      title: 'Daily Check-in Reminder',
      body: 'Time for your daily wellness check-in! How are you feeling today?',
      tag: 'daily-reminder',
      requireInteraction: true,
      actions: [
        {
          action: 'checkin',
          title: 'Start Check-in',
          icon: '/icon-192x192.png',
        },
        {
          action: 'snooze',
          title: 'Remind Later',
        },
      ],
    })
  }

  async showScoreUpdate(calmIndex: number, productivityIndex: number): Promise<void> {
    await this.showNotification({
      title: 'Your Daily Scores Are Ready!',
      body: `Calm Index: ${calmIndex}/100, Productivity Index: ${productivityIndex}/100`,
      tag: 'score-update',
      data: { calmIndex, productivityIndex },
    })
  }

  async showRecommendationAlert(): Promise<void> {
    await this.showNotification({
      title: 'New Recommendations Available',
      body: 'Check out your personalized wellness recommendations for today.',
      tag: 'recommendations',
      requireInteraction: true,
    })
  }

  async showStreakMilestone(days: number): Promise<void> {
    await this.showNotification({
      title: 'Streak Milestone! 🎉',
      body: `You've completed ${days} days of daily check-ins! Keep up the great work!`,
      tag: 'streak-milestone',
      data: { days },
    })
  }

  async showMotivationalMessage(): Promise<void> {
    const messages = [
      'You\'re doing great! Every small step counts towards your wellness journey.',
      'Remember: progress, not perfection. You\'re building healthy habits!',
      'Your mental wellness matters. Take a moment to breathe and reflect.',
      'Consistency is key. You\'re building a stronger, more mindful you!',
    ]

    const randomMessage = messages[Math.floor(Math.random() * messages.length)]

    await this.showNotification({
      title: 'Wellness Reminder',
      body: randomMessage,
      tag: 'motivational',
      silent: true,
    })
  }

  // Schedule notifications
  scheduleDailyReminder(hour: number = 9): void {
    if (!this.isSupported) return

    // This would integrate with a service worker for background scheduling
    // For now, we'll use a simple approach
    const now = new Date()
    const reminderTime = new Date()
    reminderTime.setHours(hour, 0, 0, 0)

    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1)
    }

    const timeUntilReminder = reminderTime.getTime() - now.getTime()

    setTimeout(() => {
      this.showDailyReminder()
      // Schedule the next reminder
      this.scheduleDailyReminder(hour)
    }, timeUntilReminder)
  }

  // Clear all notifications
  clearAllNotifications(): void {
    if (this.isSupported && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.getNotifications().then((notifications) => {
          notifications.forEach((notification) => {
            notification.close()
          })
        })
      })
    }
  }
}

// Singleton instance
export const notificationService = new NotificationService()

// React hook for notifications
export function useNotifications() {
  const requestPermission = async () => {
    return await notificationService.requestPermission()
  }

  const showNotification = async (options: NotificationOptions) => {
    return await notificationService.showNotification(options)
  }

  const showDailyReminder = async () => {
    return await notificationService.showDailyReminder()
  }

  const showScoreUpdate = async (calmIndex: number, productivityIndex: number) => {
    return await notificationService.showScoreUpdate(calmIndex, productivityIndex)
  }

  const showRecommendationAlert = async () => {
    return await notificationService.showRecommendationAlert()
  }

  const showStreakMilestone = async (days: number) => {
    return await notificationService.showStreakMilestone(days)
  }

  const showMotivationalMessage = async () => {
    return await notificationService.showMotivationalMessage()
  }

  const scheduleDailyReminder = (hour: number = 9) => {
    notificationService.scheduleDailyReminder(hour)
  }

  const clearAllNotifications = () => {
    notificationService.clearAllNotifications()
  }

  return {
    requestPermission,
    showNotification,
    showDailyReminder,
    showScoreUpdate,
    showRecommendationAlert,
    showStreakMilestone,
    showMotivationalMessage,
    scheduleDailyReminder,
    clearAllNotifications,
    isSupported: notificationService.isSupported,
    permission: notificationService.permission,
  }
}
