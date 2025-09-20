interface InsightData {
  checkIns: Array<{
    date: string
    mood: number
    sleep: number
    calmIndex: number
    productivityIndex: number
  }>
  recommendations: Array<{
    date: string
    type: string
    content: string
  }>
  chatInteractions: Array<{
    date: string
    questionLength: number
    responseTime: number
  }>
}

interface TrendAnalysis {
  period: 'week' | 'month' | 'quarter'
  trend: 'improving' | 'declining' | 'stable'
  change: number
  significance: 'low' | 'medium' | 'high'
}

interface Insight {
  type: 'trend' | 'pattern' | 'recommendation' | 'achievement'
  title: string
  description: string
  data?: any
  actionable?: boolean
  priority: 'low' | 'medium' | 'high'
}

export class AnalyticsInsights {
  private data: InsightData

  constructor(data: InsightData) {
    this.data = data
  }

  // Trend analysis
  analyzeTrends(): Insight[] {
    const insights: Insight[] = []

    // Mood trend analysis
    const moodTrend = this.calculateTrend(this.data.checkIns.map(c => c.mood))
    if (moodTrend.significance === 'high') {
      insights.push({
        type: 'trend',
        title: 'Mood Trend Analysis',
        description: `Your mood has been ${moodTrend.trend} over the past period with a ${Math.abs(moodTrend.change).toFixed(1)} point change.`,
        data: moodTrend,
        actionable: true,
        priority: moodTrend.trend === 'declining' ? 'high' : 'medium',
      })
    }

    // Sleep pattern analysis
    const sleepTrend = this.calculateTrend(this.data.checkIns.map(c => c.sleep))
    if (sleepTrend.significance === 'high') {
      insights.push({
        type: 'trend',
        title: 'Sleep Pattern Analysis',
        description: `Your sleep duration has been ${sleepTrend.trend} with an average change of ${Math.abs(sleepTrend.change).toFixed(1)} hours.`,
        data: sleepTrend,
        actionable: true,
        priority: sleepTrend.trend === 'declining' ? 'high' : 'medium',
      })
    }

    // Score correlation analysis
    const scoreCorrelation = this.analyzeScoreCorrelation()
    if (scoreCorrelation) {
      insights.push({
        type: 'pattern',
        title: 'Score Correlation Insight',
        description: scoreCorrelation.description,
        data: scoreCorrelation,
        actionable: true,
        priority: 'medium',
      })
    }

    return insights
  }

  // Pattern recognition
  identifyPatterns(): Insight[] {
    const insights: Insight[] = []

    // Weekly pattern analysis
    const weeklyPattern = this.analyzeWeeklyPatterns()
    if (weeklyPattern) {
      insights.push({
        type: 'pattern',
        title: 'Weekly Pattern Detected',
        description: weeklyPattern.description,
        data: weeklyPattern,
        actionable: true,
        priority: 'medium',
      })
    }

    // Consistency analysis
    const consistency = this.analyzeConsistency()
    if (consistency) {
      insights.push({
        type: 'achievement',
        title: 'Consistency Achievement',
        description: consistency.description,
        data: consistency,
        actionable: false,
        priority: 'low',
      })
    }

    return insights
  }

  // Personalized recommendations
  generateRecommendations(): Insight[] {
    const insights: Insight[] = []

    // Based on low scores
    const lowScoreInsights = this.analyzeLowScores()
    insights.push(...lowScoreInsights)

    // Based on patterns
    const patternInsights = this.analyzePatternsForRecommendations()
    insights.push(...patternInsights)

    return insights
  }

  // Achievement recognition
  recognizeAchievements(): Insight[] {
    const insights: Insight[] = []

    // Streak achievements
    const streakAchievements = this.analyzeStreaks()
    insights.push(...streakAchievements)

    // Improvement achievements
    const improvementAchievements = this.analyzeImprovements()
    insights.push(...improvementAchievements)

    return insights
  }

  // Helper methods
  private calculateTrend(values: number[]): TrendAnalysis {
    if (values.length < 3) {
      return {
        period: 'week',
        trend: 'stable',
        change: 0,
        significance: 'low',
      }
    }

    const firstHalf = values.slice(0, Math.floor(values.length / 2))
    const secondHalf = values.slice(Math.floor(values.length / 2))

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length

    const change = secondAvg - firstAvg
    const changePercent = Math.abs(change) / firstAvg

    let significance: 'low' | 'medium' | 'high' = 'low'
    if (changePercent > 0.2) significance = 'high'
    else if (changePercent > 0.1) significance = 'medium'

    let trend: 'improving' | 'declining' | 'stable' = 'stable'
    if (change > 0.5) trend = 'improving'
    else if (change < -0.5) trend = 'declining'

    return {
      period: 'week',
      trend,
      change,
      significance,
    }
  }

  private analyzeScoreCorrelation(): any {
    const correlations = []
    
    // Mood vs Calm Index
    const moodCalmCorr = this.calculateCorrelation(
      this.data.checkIns.map(c => c.mood),
      this.data.checkIns.map(c => c.calmIndex)
    )

    if (Math.abs(moodCalmCorr) > 0.7) {
      correlations.push({
        type: 'mood-calm',
        correlation: moodCalmCorr,
        description: `Strong ${moodCalmCorr > 0 ? 'positive' : 'negative'} correlation between mood and calm index.`,
      })
    }

    // Sleep vs Productivity
    const sleepProdCorr = this.calculateCorrelation(
      this.data.checkIns.map(c => c.sleep),
      this.data.checkIns.map(c => c.productivityIndex)
    )

    if (Math.abs(sleepProdCorr) > 0.7) {
      correlations.push({
        type: 'sleep-productivity',
        correlation: sleepProdCorr,
        description: `Strong ${sleepProdCorr > 0 ? 'positive' : 'negative'} correlation between sleep and productivity.`,
      })
    }

    return correlations.length > 0 ? correlations[0] : null
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0

    const n = x.length
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0)

    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

    return denominator === 0 ? 0 : numerator / denominator
  }

  private analyzeWeeklyPatterns(): any {
    // Analyze patterns by day of week
    const dayPatterns = this.data.checkIns.reduce((acc, checkIn) => {
      const day = new Date(checkIn.date).getDay()
      if (!acc[day]) acc[day] = []
      acc[day].push(checkIn.mood)
      return acc
    }, {} as Record<number, number[]>)

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayAverages = Object.entries(dayPatterns).map(([day, moods]) => ({
      day: dayNames[parseInt(day)],
      averageMood: moods.reduce((a, b) => a + b, 0) / moods.length,
    }))

    const lowestDay = dayAverages.reduce((min, day) => 
      day.averageMood < min.averageMood ? day : min
    )

    if (lowestDay.averageMood < 5) {
      return {
        description: `You tend to have lower mood on ${lowestDay.day}s. Consider planning extra self-care activities for this day.`,
        data: { lowestDay, dayAverages },
      }
    }

    return null
  }

  private analyzeConsistency(): any {
    const checkInCount = this.data.checkIns.length
    const daysSinceFirst = Math.ceil(
      (new Date().getTime() - new Date(this.data.checkIns[0]?.date).getTime()) / (1000 * 60 * 60 * 24)
    )

    const consistencyRate = checkInCount / Math.max(daysSinceFirst, 1)

    if (consistencyRate > 0.8) {
      return {
        description: `Excellent consistency! You've completed ${Math.round(consistencyRate * 100)}% of possible check-ins.`,
        data: { consistencyRate, checkInCount, daysSinceFirst },
      }
    }

    return null
  }

  private analyzeLowScores(): Insight[] {
    const insights: Insight[] = []
    const recentCheckIns = this.data.checkIns.slice(-7) // Last 7 days

    const lowCalmDays = recentCheckIns.filter(c => c.calmIndex < 50).length
    const lowProductivityDays = recentCheckIns.filter(c => c.productivityIndex < 50).length

    if (lowCalmDays > 3) {
      insights.push({
        type: 'recommendation',
        title: 'Calm Index Improvement',
        description: 'Your calm index has been low recently. Consider practicing mindfulness or stress-reduction techniques.',
        actionable: true,
        priority: 'high',
      })
    }

    if (lowProductivityDays > 3) {
      insights.push({
        type: 'recommendation',
        title: 'Productivity Enhancement',
        description: 'Your productivity index could use a boost. Try breaking tasks into smaller chunks or improving your sleep routine.',
        actionable: true,
        priority: 'high',
      })
    }

    return insights
  }

  private analyzePatternsForRecommendations(): Insight[] {
    // This would analyze patterns and suggest specific recommendations
    return []
  }

  private analyzeStreaks(): Insight[] {
    const insights: Insight[] = []
    const streak = this.calculateCurrentStreak()

    if (streak >= 7) {
      insights.push({
        type: 'achievement',
        title: 'Weekly Streak!',
        description: `Amazing! You've completed ${streak} days in a row.`,
        data: { streak },
        actionable: false,
        priority: 'low',
      })
    }

    return insights
  }

  private analyzeImprovements(): Insight[] {
    const insights: Insight[] = []
    // Analyze improvements over time
    return insights
  }

  private calculateCurrentStreak(): number {
    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const dateStr = checkDate.toISOString().split('T')[0]
      
      if (this.data.checkIns.some(c => c.date.startsWith(dateStr))) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  // Generate comprehensive insights
  generateAllInsights(): Insight[] {
    return [
      ...this.analyzeTrends(),
      ...this.identifyPatterns(),
      ...this.generateRecommendations(),
      ...this.recognizeAchievements(),
    ].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }
}

// React hook for insights
export function useAnalyticsInsights(data: InsightData) {
  const insights = new AnalyticsInsights(data)
  
  return {
    trends: insights.analyzeTrends(),
    patterns: insights.identifyPatterns(),
    recommendations: insights.generateRecommendations(),
    achievements: insights.recognizeAchievements(),
    allInsights: insights.generateAllInsights(),
  }
}
