import { submitDailyCheckin, submitChatMessage } from '@/app/actions'
import { analyzeMentalStateAndProvideScores } from '@/ai/flows/analyze-mental-state-and-provide-scores'
import { providePersonalizedRecommendations } from '@/ai/flows/provide-personalized-recommendations'
import { recommendHabitTools } from '@/ai/flows/recommend-habit-tools'
import { answerQuestionsAndProvideGuidance } from '@/ai/flows/answer-questions-and-provide-guidance'

// Mock AI flows
jest.mock('@/ai/flows/analyze-mental-state-and-provide-scores')
jest.mock('@/ai/flows/provide-personalized-recommendations')
jest.mock('@/ai/flows/recommend-habit-tools')
jest.mock('@/ai/flows/answer-questions-and-provide-guidance')

const mockAnalyzeMentalState = analyzeMentalStateAndProvideScores as jest.MockedFunction<typeof analyzeMentalStateAndProvideScores>
const mockProvideRecommendations = providePersonalizedRecommendations as jest.MockedFunction<typeof providePersonalizedRecommendations>
const mockRecommendHabitTools = recommendHabitTools as jest.MockedFunction<typeof recommendHabitTools>
const mockAnswerQuestions = answerQuestionsAndProvideGuidance as jest.MockedFunction<typeof answerQuestionsAndProvideGuidance>

describe('Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('submitDailyCheckin', () => {
    it('should process daily checkin successfully', async () => {
      const mockState = {
        checkIn: { mood: 7, sleep: 8, diet: '', exercise: '', stressors: '', userGoals: '' },
        scores: { calmIndex: 0, productivityIndex: 0 },
        scoreHistory: [],
        recommendations: { personalized: [], habitTools: [] },
        chatHistory: [],
        userGoals: '',
      }

      const formData = new FormData()
      formData.append('mood', '7')
      formData.append('sleep', '8')
      formData.append('diet', 'Healthy meals')
      formData.append('exercise', '30 min walk')
      formData.append('stressors', 'Work deadlines')
      formData.append('userGoals', 'Reduce stress')

      // Mock AI responses
      mockAnalyzeMentalState.mockResolvedValueOnce({
        calmIndex: 75,
        productivityIndex: 80,
      })

      mockProvideRecommendations.mockResolvedValueOnce({
        recommendations: ['Practice mindfulness', 'Take breaks'],
      })

      mockRecommendHabitTools.mockResolvedValueOnce({
        recommendations: ['Deep breathing', 'Exercise'],
      })

      const result = await submitDailyCheckin(mockState, formData)

      expect(result.status).toBe('success')
      expect(result.data).toEqual({
        scores: { calmIndex: 75, productivityIndex: 80 },
        personalizedRecommendations: ['Practice mindfulness', 'Take breaks'],
        habitTools: ['Deep breathing', 'Exercise'],
      })
    })

    it('should handle invalid form data', async () => {
      const mockState = {
        checkIn: { mood: 7, sleep: 8, diet: '', exercise: '', stressors: '', userGoals: '' },
        scores: { calmIndex: 0, productivityIndex: 0 },
        scoreHistory: [],
        recommendations: { personalized: [], habitTools: [] },
        chatHistory: [],
        userGoals: '',
      }

      const formData = new FormData()
      // Missing required fields

      const result = await submitDailyCheckin(mockState, formData)

      expect(result.status).toBe('error')
      expect(result.error).toBe('Invalid form data.')
    })

    it('should handle AI flow errors', async () => {
      const mockState = {
        checkIn: { mood: 7, sleep: 8, diet: '', exercise: '', stressors: '', userGoals: '' },
        scores: { calmIndex: 0, productivityIndex: 0 },
        scoreHistory: [],
        recommendations: { personalized: [], habitTools: [] },
        chatHistory: [],
        userGoals: '',
      }

      const formData = new FormData()
      formData.append('mood', '7')
      formData.append('sleep', '8')
      formData.append('diet', 'Healthy meals')
      formData.append('exercise', '30 min walk')
      formData.append('stressors', 'Work deadlines')
      formData.append('userGoals', 'Reduce stress')

      mockAnalyzeMentalState.mockRejectedValueOnce(new Error('AI service error'))

      const result = await submitDailyCheckin(mockState, formData)

      expect(result.status).toBe('error')
      expect(result.error).toBe('Failed to process data. Please try again.')
    })
  })

  describe('submitChatMessage', () => {
    it('should process chat message successfully', async () => {
      const formData = new FormData()
      formData.append('question', 'How can I reduce stress?')
      formData.append('checkInData', JSON.stringify({
        mood: 7,
        sleep: 8,
        diet: 'Healthy meals',
        exercise: '30 min walk',
        stressors: 'Work deadlines',
      }))
      formData.append('scores', JSON.stringify({
        calmIndex: 75,
        productivityIndex: 80,
      }))

      mockAnswerQuestions.mockResolvedValueOnce({
        answer: 'Try deep breathing exercises and regular breaks.',
      })

      const result = await submitChatMessage(formData)

      expect(result.status).toBe('success')
      expect(result.answer).toBe('Try deep breathing exercises and regular breaks.')
    })

    it('should handle incomplete check-in data', async () => {
      const formData = new FormData()
      formData.append('question', 'How can I reduce stress?')
      formData.append('checkInData', JSON.stringify({
        mood: 7,
        sleep: 8,
        diet: '',
        exercise: '',
        stressors: '',
      }))
      formData.append('scores', JSON.stringify({
        calmIndex: 0,
        productivityIndex: 0,
      }))

      const result = await submitChatMessage(formData)

      expect(result.status).toBe('success')
      expect(result.answer).toContain("complete your daily check-in")
    })
  })
})
