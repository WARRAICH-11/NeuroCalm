import { FirestoreService } from '@/lib/firebase/firestore';
import type { CheckInData, Score } from '@/lib/types';

// Mock Firebase
jest.mock('@/lib/firebase/client-app', () => ({
  db: {
    collection: jest.fn(),
    doc: jest.fn()
  }
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  onSnapshot: jest.fn(),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'mock-timestamp'),
  where: jest.fn(),
  getDocs: jest.fn()
}));

describe('FirestoreService', () => {
  const mockUid = 'test-user-id';
  const mockEmail = 'test@example.com';
  const mockCheckInData: CheckInData = {
    mood: 8,
    sleep: 7.5,
    diet: 'Healthy meals',
    exercise: '30 min walk',
    stressors: 'Work deadline',
    userGoals: 'Reduce stress'
  };
  const mockScores: Score = {
    calmIndex: 75,
    productivityIndex: 80
  };
  const mockRecommendations = {
    personalized: ['Take deep breaths', 'Go for a walk'],
    habitTools: ['Meditation app', 'Breathing exercises']
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUserProfile', () => {
    it('should create a user profile with default preferences', async () => {
      const { setDoc } = require('firebase/firestore');
      setDoc.mockResolvedValueOnce(undefined);

      await FirestoreService.createUserProfile(mockUid, mockEmail, 'Test User');

      expect(setDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          uid: mockUid,
          email: mockEmail,
          displayName: 'Test User',
          preferences: {
            theme: 'system',
            notifications: true,
            dataRetention: 90
          },
          goals: '',
          onboardingCompleted: false
        })
      );
    });
  });

  describe('saveDailyCheckIn', () => {
    it('should save daily check-in data with today\'s date', async () => {
      const { setDoc } = require('firebase/firestore');
      setDoc.mockResolvedValueOnce(undefined);

      await FirestoreService.saveDailyCheckIn(
        mockUid,
        mockCheckInData,
        mockScores,
        mockRecommendations
      );

      expect(setDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          uid: mockUid,
          checkIn: mockCheckInData,
          scores: mockScores,
          recommendations: mockRecommendations
        }),
        { merge: true }
      );
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile if exists', async () => {
      const mockProfile = {
        uid: mockUid,
        email: mockEmail,
        preferences: { theme: 'dark' }
      };

      const { getDoc } = require('firebase/firestore');
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => mockProfile
      });

      const result = await FirestoreService.getUserProfile(mockUid);

      expect(result).toEqual(mockProfile);
    });

    it('should return null if user profile does not exist', async () => {
      const { getDoc } = require('firebase/firestore');
      getDoc.mockResolvedValueOnce({
        exists: () => false
      });

      const result = await FirestoreService.getUserProfile(mockUid);

      expect(result).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle Firestore errors gracefully', async () => {
      const { getDoc } = require('firebase/firestore');
      getDoc.mockRejectedValueOnce(new Error('Firestore error'));

      await expect(FirestoreService.getUserProfile(mockUid)).rejects.toThrow('Firestore error');
    });
  });
});
