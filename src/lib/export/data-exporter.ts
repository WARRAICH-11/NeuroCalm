import { format } from 'date-fns'

interface ExportOptions {
  format: 'json' | 'csv' | 'pdf'
  dateRange?: {
    start: Date
    end: Date
  }
  includeScores?: boolean
  includeRecommendations?: boolean
  includeChatHistory?: boolean
}

interface ExportData {
  userProfile: any
  checkIns: any[]
  scores: any[]
  recommendations: any[]
  chatHistory: any[]
  exportDate: string
}

export class DataExporter {
  private data: ExportData

  constructor(data: ExportData) {
    this.data = data
  }

  async exportToJSON(): Promise<Blob> {
    const exportData = {
      ...this.data,
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        format: 'json',
      },
    }

    const jsonString = JSON.stringify(exportData, null, 2)
    return new Blob([jsonString], { type: 'application/json' })
  }

  async exportToCSV(): Promise<Blob> {
    const csvRows: string[] = []
    
    // Add header
    csvRows.push('Date,Mood,Sleep,Diet,Exercise,Stressors,Calm Index,Productivity Index')
    
    // Add data rows
    this.data.checkIns.forEach((checkIn, index) => {
      const score = this.data.scores[index]
      const row = [
        checkIn.date,
        checkIn.mood,
        checkIn.sleep,
        `"${checkIn.diet}"`,
        `"${checkIn.exercise}"`,
        `"${checkIn.stressors}"`,
        score?.calmIndex || '',
        score?.productivityIndex || '',
      ].join(',')
      csvRows.push(row)
    })

    const csvString = csvRows.join('\n')
    return new Blob([csvString], { type: 'text/csv' })
  }

  async exportToPDF(): Promise<Blob> {
    // This would require a PDF generation library like jsPDF
    // For now, return a simple text representation
    const pdfContent = this.generatePDFContent()
    return new Blob([pdfContent], { type: 'text/plain' })
  }

  private generatePDFContent(): string {
    const content = [
      'NeuroCalm Data Export',
      '====================',
      '',
      `Export Date: ${this.data.exportDate}`,
      `User: ${this.data.userProfile?.displayName || 'Unknown'}`,
      '',
      'Daily Check-ins:',
      '----------------',
    ]

    this.data.checkIns.forEach((checkIn, index) => {
      const score = this.data.scores[index]
      content.push(
        `Date: ${checkIn.date}`,
        `Mood: ${checkIn.mood}/10`,
        `Sleep: ${checkIn.sleep} hours`,
        `Diet: ${checkIn.diet}`,
        `Exercise: ${checkIn.exercise}`,
        `Stressors: ${checkIn.stressors}`,
        `Calm Index: ${score?.calmIndex || 'N/A'}`,
        `Productivity Index: ${score?.productivityIndex || 'N/A'}`,
        ''
      )
    })

    if (this.data.recommendations.length > 0) {
      content.push(
        'Recommendations:',
        '----------------'
      )
      this.data.recommendations.forEach((rec, index) => {
        content.push(`${index + 1}. ${rec}`)
      })
      content.push('')
    }

    return content.join('\n')
  }

  static async downloadFile(blob: Blob, filename: string): Promise<void> {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  static generateFilename(format: string, dateRange?: { start: Date; end: Date }): string {
    const timestamp = format(new Date(), 'yyyy-MM-dd')
    const range = dateRange 
      ? `_${format(dateRange.start, 'yyyy-MM-dd')}_to_${format(dateRange.end, 'yyyy-MM-dd')}`
      : ''
    
    return `neurocalm_export_${timestamp}${range}.${format}`
  }
}

// React hook for data export
export function useDataExport() {
  const exportData = async (options: ExportOptions) => {
    try {
      // This would fetch data from your API
      const data: ExportData = {
        userProfile: {},
        checkIns: [],
        scores: [],
        recommendations: [],
        chatHistory: [],
        exportDate: new Date().toISOString(),
      }

      const exporter = new DataExporter(data)
      let blob: Blob

      switch (options.format) {
        case 'json':
          blob = await exporter.exportToJSON()
          break
        case 'csv':
          blob = await exporter.exportToCSV()
          break
        case 'pdf':
          blob = await exporter.exportToPDF()
          break
        default:
          throw new Error('Unsupported export format')
      }

      const filename = DataExporter.generateFilename(options.format, options.dateRange)
      await DataExporter.downloadFile(blob, filename)

      return { success: true, filename }
    } catch (error) {
      console.error('Export failed:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Export failed' }
    }
  }

  return { exportData }
}
