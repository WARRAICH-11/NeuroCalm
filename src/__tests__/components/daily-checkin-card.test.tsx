import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import DailyCheckinCard from '@/components/dashboard/daily-checkin-card'

// Mock the form hook
jest.mock('react-hook-form', () => ({
  useForm: jest.fn(),
}))

const mockForm = {
  control: {},
  handleSubmit: jest.fn((fn) => (e) => {
    e.preventDefault()
    fn({
      mood: 7,
      sleep: 8,
      diet: 'Healthy meals',
      exercise: '30 min walk',
      stressors: 'Work deadlines',
    })
  }),
}

describe('DailyCheckinCard', () => {
  beforeEach(() => {
    (useForm as jest.Mock).mockReturnValue(mockForm)
  })

  it('renders all form fields', () => {
    render(
      <DailyCheckinCard
        form={mockForm as any}
        onSubmit={jest.fn()}
        isPending={false}
      />
    )

    expect(screen.getByText('Daily Check-in')).toBeInTheDocument()
    expect(screen.getByText('Mood (1-10): 7')).toBeInTheDocument()
    expect(screen.getByText('Sleep (hours): 8')).toBeInTheDocument()
    expect(screen.getByLabelText('Diet')).toBeInTheDocument()
    expect(screen.getByLabelText('Exercise')).toBeInTheDocument()
    expect(screen.getByLabelText('Stressors')).toBeInTheDocument()
  })

  it('calls onSubmit when form is submitted', async () => {
    const mockOnSubmit = jest.fn()
    
    render(
      <DailyCheckinCard
        form={mockForm as any}
        onSubmit={mockOnSubmit}
        isPending={false}
      />
    )

    const submitButton = screen.getByText('Update & Analyze')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        mood: 7,
        sleep: 8,
        diet: 'Healthy meals',
        exercise: '30 min walk',
        stressors: 'Work deadlines',
      })
    })
  })

  it('disables submit button when pending', () => {
    render(
      <DailyCheckinCard
        form={mockForm as any}
        onSubmit={jest.fn()}
        isPending={true}
      />
    )

    const submitButton = screen.getByText('Update & Analyze')
    expect(submitButton).toBeDisabled()
  })
})
