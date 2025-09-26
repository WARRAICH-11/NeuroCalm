"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { FirestoreService, type UserProfile, type DailyCheckInDocument } from '@/lib/firebase/firestore';
import type { DailyState, CheckInData, Score, ScoreHistoryItem, ChatMessage } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';

export function useFirestoreData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dailyState, setDailyState] = useState<DailyState | null>(null);

  // Initialize user data
  const initializeUserData = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      
      // Get or create user profile
      let profile = await FirestoreService.getUserProfile(user.uid);
      if (!profile) {
        await FirestoreService.createUserProfile(
          user.uid, 
          user.email || '', 
          user.displayName || undefined
        );
        profile = await FirestoreService.getUserProfile(user.uid);
      }
      setUserProfile(profile);

      // Get today's check-in data
      const todayCheckIn = await FirestoreService.getDailyCheckIn(user.uid);
      
      // Get score history
      const scoreHistory = await FirestoreService.getScoreHistory(user.uid, 7);

      // Initialize daily state
      const defaultState: DailyState = {
        checkIn: todayCheckIn?.checkIn || {
          mood: 7,
          sleep: 8,
          diet: "",
          exercise: "",
          stressors: "",
          userGoals: profile?.goals || "Reduce stress and improve focus."
        },
        scores: todayCheckIn?.scores || { calmIndex: 0, productivityIndex: 0 },
        scoreHistory,
        recommendations: todayCheckIn?.recommendations || { personalized: [], habitTools: [] },
        chatHistory: [
          {
            role: "assistant",
            content: "Hello! I'm your AI Brain Coach. How can I help you today?",
          },
        ],
        userGoals: profile?.goals || "Reduce stress and improve focus.",
      };

      setDailyState(defaultState);
    } catch (error) {
      console.error('Error initializing user data:', error);
      toast({
        variant: "destructive",
        title: "Data Loading Error",
        description: "Failed to load your data. Please refresh the page.",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.uid, user?.email, user?.displayName, toast]);

  // Save daily check-in to Firestore
  const saveDailyCheckIn = useCallback(async (
    checkInData: CheckInData,
    scores: Score,
    recommendations: { personalized: string[]; habitTools: string[] }
  ) => {
    if (!user?.uid || !dailyState) return;

    try {
      await FirestoreService.saveDailyCheckIn(user.uid, checkInData, scores, recommendations);
      
      // Update local state
      setDailyState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          checkIn: checkInData,
          scores,
          recommendations,
          scoreHistory: [
            ...prev.scoreHistory.slice(-6), // Keep last 6 days
            {
              ...scores,
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            }
          ]
        };
      });

      toast({
        title: "Data Saved",
        description: "Your check-in has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving daily check-in:', error);
      toast({
        variant: "destructive",
        title: "Save Error",
        description: "Failed to save your check-in. Please try again.",
      });
      throw error;
    }
  }, [user?.uid, dailyState, toast]);

  // Update user profile
  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user?.uid) return;

    try {
      await FirestoreService.updateUserProfile(user.uid, updates);
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast({
        variant: "destructive",
        title: "Update Error",
        description: "Failed to update your profile. Please try again.",
      });
      throw error;
    }
  }, [user?.uid, toast]);

  // Update chat history
  const updateChatHistory = useCallback((newMessages: ChatMessage[]) => {
    setDailyState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        chatHistory: newMessages
      };
    });
  }, []);

  // Real-time score history subscription
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = FirestoreService.subscribeToScoreHistory(
      user.uid,
      (history) => {
        setDailyState(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            scoreHistory: history
          };
        });
      },
      7
    );

    return unsubscribe;
  }, [user?.uid]);

  // Initialize data when user changes
  useEffect(() => {
    if (user?.uid) {
      initializeUserData();
    } else {
      setUserProfile(null);
      setDailyState(null);
      setLoading(false);
    }
  }, [user?.uid, initializeUserData]);

  return {
    loading,
    userProfile,
    dailyState,
    saveDailyCheckIn,
    updateUserProfile,
    updateChatHistory,
    initializeUserData
  };
}
