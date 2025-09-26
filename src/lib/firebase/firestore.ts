"use client";

import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc,
  serverTimestamp,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from './client-app';
import type { 
  DailyState, 
  CheckInData, 
  Score, 
  ScoreHistoryItem, 
  ChatMessage 
} from '@/lib/types';

// User profile data structure
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: any;
  updatedAt: any;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    dataRetention: number; // days
  };
  goals: string;
  onboardingCompleted: boolean;
}

// Daily check-in document structure
export interface DailyCheckInDocument {
  uid: string;
  date: string; // YYYY-MM-DD format
  checkIn: CheckInData;
  scores: Score;
  recommendations: {
    personalized: string[];
    habitTools: string[];
  };
  createdAt: any;
  updatedAt: any;
}

// Chat session document structure
export interface ChatSessionDocument {
  uid: string;
  sessionId: string;
  messages: ChatMessage[];
  createdAt: any;
  updatedAt: any;
}

// Firestore service class
export class FirestoreService {
  // User Profile Operations
  static async createUserProfile(uid: string, email: string, displayName?: string): Promise<void> {
    const userProfile: UserProfile = {
      uid,
      email,
      displayName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      preferences: {
        theme: 'system',
        notifications: true,
        dataRetention: 90
      },
      goals: '',
      onboardingCompleted: false
    };

    await setDoc(doc(db, 'users', uid), userProfile);
  }

  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  static async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Daily Check-in Operations
  static async saveDailyCheckIn(
    uid: string, 
    checkInData: CheckInData, 
    scores: Score,
    recommendations: { personalized: string[]; habitTools: string[] }
  ): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const docRef = doc(db, 'dailyCheckIns', `${uid}_${today}`);
      
      const dailyCheckIn: DailyCheckInDocument = {
        uid,
        date: today,
        checkIn: checkInData,
        scores,
        recommendations,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(docRef, dailyCheckIn, { merge: true });
    } catch (error) {
      console.error('Error saving daily check-in:', error);
      throw error;
    }
  }

  static async getDailyCheckIn(uid: string, date?: string): Promise<DailyCheckInDocument | null> {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const docRef = doc(db, 'dailyCheckIns', `${uid}_${targetDate}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as DailyCheckInDocument;
      }
      return null;
    } catch (error) {
      console.error('Error fetching daily check-in:', error);
      throw error;
    }
  }

  static async getScoreHistory(uid: string, days: number = 7): Promise<ScoreHistoryItem[]> {
    try {
      const q = query(
        collection(db, 'dailyCheckIns'),
        where('uid', '==', uid),
        orderBy('date', 'desc'),
        limit(days)
      );

      const querySnapshot = await getDocs(q);
      const history: ScoreHistoryItem[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as DailyCheckInDocument;
        history.push({
          ...data.scores,
          date: new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });
      });

      return history.reverse(); // Return chronological order
    } catch (error) {
      console.error('Error fetching score history:', error);
      throw error;
    }
  }

  // Real-time listeners
  static subscribeToScoreHistory(
    uid: string, 
    callback: (history: ScoreHistoryItem[]) => void,
    days: number = 7
  ): () => void {
    const q = query(
      collection(db, 'dailyCheckIns'),
      where('uid', '==', uid),
      orderBy('date', 'desc'),
      limit(days)
    );

    return onSnapshot(q, (querySnapshot) => {
      const history: ScoreHistoryItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DailyCheckInDocument;
        history.push({
          ...data.scores,
          date: new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });
      });
      callback(history.reverse());
    });
  }

  // Chat Operations
  static async saveChatSession(uid: string, messages: ChatMessage[]): Promise<string> {
    try {
      const sessionId = `${uid}_${Date.now()}`;
      const chatSession: ChatSessionDocument = {
        uid,
        sessionId,
        messages,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'chatSessions'), chatSession);
      return docRef.id;
    } catch (error) {
      console.error('Error saving chat session:', error);
      throw error;
    }
  }

  static async updateChatSession(sessionId: string, messages: ChatMessage[]): Promise<void> {
    try {
      const docRef = doc(db, 'chatSessions', sessionId);
      await updateDoc(docRef, {
        messages,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating chat session:', error);
      throw error;
    }
  }

  // Data cleanup (for GDPR compliance)
  static async deleteUserData(uid: string): Promise<void> {
    try {
      // Delete user profile
      await setDoc(doc(db, 'users', uid), {});
      
      // Delete check-ins (would need cloud function for batch delete in production)
      const checkInsQuery = query(
        collection(db, 'dailyCheckIns'),
        where('uid', '==', uid)
      );
      const checkInsSnapshot = await getDocs(checkInsQuery);
      
      const deletePromises = checkInsSnapshot.docs.map(doc => 
        setDoc(doc.ref, {})
      );
      
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  }
}
