import { renderHook, act, waitFor } from '@testing-library/react';
import { useFirestoreData } from '@/hooks/use-firestore-data';
import { useAuth } from '@/lib/firebase/auth-provider';
import { FirestoreService } from '@/lib/firebase/firestore';

// Mock dependencies
jest.mock('@/lib/firebase/auth-provider');
jest.mock('@/lib/firebase/firestore');
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

describe('useFirestoreData', () => {
  const mockUser = {
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User'
  };

  const mockUserProfile = {
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
    preferences: {
      theme: 'system' as const,
      notifications: true,
      dataRetention: 90
    },
    goals: 'Reduce stress and improve focus',
    onboardingCompleted: false
  };

  const mockDailyCheckIn = {
    uid: 'test-user-id',
    date: '2024-01-01',
    checkIn: {
      mood: 8,
      sleep: 7.5,
      diet: 'Healthy meals',
      exercise: '30 min walk',
      stressors: 'Work deadline',
      userGoals: 'Reduce stress'
    },
    scores: {
      calmIndex: 75,
      productivityIndex: 80
    },
    recommendations: {
      personalized: ['Take deep breaths'],
      habitTools: ['Meditation app']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock FirestoreService methods
    (FirestoreService.getUserProfile as jest.Mock) = jest.fn();
    (FirestoreService.createUserProfile as jest.Mock) = jest.fn();
    (FirestoreService.getDailyCheckIn as jest.Mock) = jest.fn();
    (FirestoreService.getScoreHistory as jest.Mock) = jest.fn();
    (FirestoreService.subscribeToScoreHistory as jest.Mock) = jest.fn();
    (FirestoreService.saveDailyCheckIn as jest.Mock) = jest.fn();
  });

  it('initializes with loading state', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null
    });

    const { result } = renderHook(() => useFirestoreData());

    expect(result.current.loading).toBe(true);
    expect(result.current.userProfile).toBeNull();
    expect(result.current.dailyState).toBeNull();
  });

  it('loads user data when user is authenticated', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser
    });

    (FirestoreService.getUserProfile as jest.Mock).mockResolvedValue(mockUserProfile);
    (FirestoreService.getDailyCheckIn as jest.Mock).mockResolvedValue(mockDailyCheckIn);
    (FirestoreService.getScoreHistory as jest.Mock).mockResolvedValue([]);
    (FirestoreService.subscribeToScoreHistory as jest.Mock).mockReturnValue(() => {});

    const { result } = renderHook(() => useFirestoreData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.userProfile).toEqual(mockUserProfile);
    expect(result.current.dailyState).toBeDefined();
    expect(result.current.dailyState?.checkIn).toEqual(mockDailyCheckIn.checkIn);
  });

  it('creates user profile if it does not exist', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser
    });

    (FirestoreService.getUserProfile as jest.Mock)
      .mockResolvedValueOnce(null) // First call returns null
      .mockResolvedValueOnce(mockUserProfile); // Second call returns profile
    (FirestoreService.createUserProfile as jest.Mock).mockResolvedValue(undefined);
    (FirestoreService.getDailyCheckIn as jest.Mock).mockResolvedValue(null);
    (FirestoreService.getScoreHistory as jest.Mock).mockResolvedValue([]);
    (FirestoreService.subscribeToScoreHistory as jest.Mock).mockReturnValue(() => {});

    const { result } = renderHook(() => useFirestoreData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(FirestoreService.createUserProfile).toHaveBeenCalledWith(
      mockUser.uid,
      mockUser.email,
      mockUser.displayName
    );
    expect(result.current.userProfile).toEqual(mockUserProfile);
  });

  it('saves daily check-in data', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser
    });

    (FirestoreService.getUserProfile as jest.Mock).mockResolvedValue(mockUserProfile);
    (FirestoreService.getDailyCheckIn as jest.Mock).mockResolvedValue(null);
    (FirestoreService.getScoreHistory as jest.Mock).mockResolvedValue([]);
    (FirestoreService.subscribeToScoreHistory as jest.Mock).mockReturnValue(() => {});
    (FirestoreService.saveDailyCheckIn as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useFirestoreData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const checkInData = mockDailyCheckIn.checkIn;
    const scores = mockDailyCheckIn.scores;
    const recommendations = mockDailyCheckIn.recommendations;

    await act(async () => {
      await result.current.saveDailyCheckIn(checkInData, scores, recommendations);
    });

    expect(FirestoreService.saveDailyCheckIn).toHaveBeenCalledWith(
      mockUser.uid,
      checkInData,
      scores,
      recommendations
    );
  });

  it('handles errors gracefully', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser
    });

    (FirestoreService.getUserProfile as jest.Mock).mockRejectedValue(new Error('Firestore error'));

    const { result } = renderHook(() => useFirestoreData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.userProfile).toBeNull();
    expect(result.current.dailyState).toBeNull();
  });
});
