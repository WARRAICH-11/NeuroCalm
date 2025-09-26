"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import type { DailyState, CheckInData } from "@/lib/types";
import { submitDailyCheckin, submitChatMessage } from "../actions";
import { useToast } from "../../components/ui/use-toast";
import { useFirestoreData } from "@/hooks/use-firestore-data";
import { PerformanceMonitor } from "@/lib/monitoring/performance";
import { EnhancedErrorHandler } from "@/lib/error-handling/enhanced-error-handler";
import { Skeleton } from "@/components/ui/skeleton";

import DailyCheckinCard from "../../components/dashboard/daily-checkin-card";
import ScoreCard from "../../components/dashboard/score-card";
import RecommendationsCard from "../../components/dashboard/recommendations-card";
import AiCoachCard from "../../components/dashboard/ai-coach-card";

const defaultState: DailyState = {
  checkIn: { 
    mood: 7, 
    sleep: 8, 
    diet: "", 
    exercise: "", 
    stressors: "",
    userGoals: "Reduce stress and improve focus." 
  },
  scores: { calmIndex: 0, productivityIndex: 0 },
  scoreHistory: [],
  recommendations: { personalized: [], habitTools: [] },
  chatHistory: [
    {
      role: "assistant",
      content: "Hello! I'm your AI Brain Coach. How can I help you today?",
    },
  ],
  userGoals: "Reduce stress and improve focus.",
};

const checkInSchema = z.object({
  mood: z.coerce.number().min(1).max(10),
  sleep: z.coerce.number().min(0).max(24),
  diet: z.string().min(1, "Please describe your diet."),
  exercise: z.string().min(1, "Please describe your exercise."),
  stressors: z.string().min(1, "Please describe your stressors."),
});

export default function DashboardPage() {
  const { loading, dailyState, saveDailyCheckIn, updateChatHistory } = useFirestoreData();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // Monitor page load performance
  useEffect(() => {
    PerformanceMonitor.monitorPageLoad('dashboard');
  }, []);

  const form = useForm<z.infer<typeof checkInSchema>>({
    resolver: zodResolver(checkInSchema),
    defaultValues: dailyState?.checkIn,
  });

  // Update form when dailyState changes
  useEffect(() => {
    if (dailyState?.checkIn) {
      form.reset(dailyState.checkIn);
    }
  }, [dailyState?.checkIn, form]);

  const handleCheckinSubmit = (values: z.infer<typeof checkInSchema>) => {
    if (!dailyState) return;

    startTransition(async () => {
      try {
        const result = await PerformanceMonitor.measureAsync(
          'daily_checkin_submit',
          async () => {
            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
              formData.append(key, String(value));
            });
            formData.append("userGoals", dailyState.userGoals);

            return await submitDailyCheckin(dailyState, formData);
          },
          { user_action: 'daily_checkin' }
        );

        if (result.status === "success" && result.data) {
          // Save to Firestore
          await saveDailyCheckIn(
            { ...values, userGoals: dailyState.userGoals },
            result.data.scores,
            {
              personalized: result.data.personalizedRecommendations,
              habitTools: result.data.habitTools,
            }
          );
        } else {
          const errorInfo = await EnhancedErrorHandler.handleError(
            new Error(result.error || "Check-in failed"),
            { action: 'daily_checkin', values }
          );
          
          toast({
            variant: "destructive",
            title: "Check-in failed",
            description: errorInfo.userMessage,
          });
        }
      } catch (error) {
        const errorInfo = await EnhancedErrorHandler.handleError(
          error as Error,
          { action: 'daily_checkin', values }
        );
        
        toast({
          variant: "destructive",
          title: "Check-in failed",
          description: errorInfo.userMessage,
        });
      }
    });
  };

  const handleChatSubmit = (question: string) => {
    if (!dailyState) return;

    startTransition(async () => {
      try {
        // Add user message to chat history
        const newUserMessage = { role: "user" as const, content: question };
        const updatedHistory = [...dailyState.chatHistory, newUserMessage];
        updateChatHistory(updatedHistory);

        const result = await PerformanceMonitor.measureAsync(
          'ai_chat_submit',
          async () => {
            const formData = new FormData();
            formData.append("question", question);
            formData.append("checkInData", JSON.stringify(dailyState.checkIn));
            formData.append("scores", JSON.stringify(dailyState.scores));

            return await submitChatMessage(formData);
          },
          { user_action: 'ai_chat', question_length: question.length.toString() }
        );

        // Add AI response to chat history
        const aiResponse = result.status === "success" && result.answer 
          ? result.answer 
          : result.error || "Sorry, something went wrong.";
        
        const newAiMessage = { role: "assistant" as const, content: aiResponse };
        updateChatHistory([...updatedHistory, newAiMessage]);

        if (result.status === "error") {
          await EnhancedErrorHandler.handleError(
            new Error(result.error || "AI chat failed"),
            { action: 'ai_chat', question }
          );
        }
      } catch (error) {
        const errorInfo = await EnhancedErrorHandler.handleError(
          error as Error,
          { action: 'ai_chat', question }
        );
        
        // Add error message to chat
        const errorMessage = { role: "assistant" as const, content: errorInfo.userMessage };
        updateChatHistory([...dailyState.chatHistory, { role: "user", content: question }, errorMessage]);
      }
    });
  };

  // Show loading skeleton while data loads
  if (loading || !dailyState) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <div className="xl:col-span-1 space-y-6">
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div className="xl:col-span-2 space-y-6">
            <Skeleton className="h-[300px] w-full" />
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[200px] w-full" />
            </div>
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mobile-first layout: Stack everything vertically on mobile */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* Daily Check-in Card - Full width on mobile, sidebar on desktop */}
        <div className="xl:col-span-1 space-y-6">
          <DailyCheckinCard
            form={form}
            onSubmit={handleCheckinSubmit}
            isPending={isPending}
          />
        </div>
        
        {/* Main content area */}
        <div className="xl:col-span-2 space-y-6">
          {/* Score Card - Full width */}
          <ScoreCard scores={dailyState.scores} history={dailyState.scoreHistory} />
          
          {/* Recommendations - Stack on mobile, side-by-side on tablet+ */}
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
            <RecommendationsCard 
              title="Today's Recommendations" 
              recommendations={dailyState.recommendations.personalized} 
            />
            <RecommendationsCard 
              title="Habit Tools" 
              recommendations={dailyState.recommendations.habitTools} 
            />
          </div>
          
          {/* AI Coach Card - Full width */}
          <AiCoachCard
            chatHistory={dailyState.chatHistory}
            onSubmit={handleChatSubmit}
            isPending={isPending}
          />
        </div>
      </div>
    </div>
  );
}
