"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import type { DailyState, CheckInData } from "@/lib/types";
import { submitDailyCheckin, submitChatMessage } from "../actions";
import { useToast } from "../../components/ui/use-toast";

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
  const [state, setState] = useState<DailyState>(defaultState);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof checkInSchema>>({
    resolver: zodResolver(checkInSchema),
    defaultValues: state.checkIn,
  });

  const handleCheckinSubmit = (values: z.infer<typeof checkInSchema>) => {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      formData.append("userGoals", state.userGoals);

      const result = await submitDailyCheckin(state, formData);

      if (result.status === "success" && result.data) {
        setState((prevState) => ({
          ...prevState,
          checkIn: {
            ...values,
            userGoals: state.userGoals
          },
          scores: result.data!.scores,
          recommendations: {
            personalized: result.data!.personalizedRecommendations,
            habitTools: result.data!.habitTools,
          },
          scoreHistory: [
            ...prevState.scoreHistory,
            { ...result.data!.scores, date: format(new Date(), "MMM d") },
          ].slice(-7), // Keep last 7 days
        }));
        toast({ title: "Check-in complete!", description: "Your scores and recommendations have been updated." });
      } else {
        toast({
          variant: "destructive",
          title: "Check-in failed",
          description: result.error || "An unknown error occurred.",
        });
      }
    });
  };

  const handleChatSubmit = (question: string) => {
    startTransition(async () => {
      setState((prevState) => ({
        ...prevState,
        chatHistory: [
          ...prevState.chatHistory,
          { role: "user", content: question },
        ],
      }));
      
      const formData = new FormData();
      formData.append("question", question);
      formData.append("checkInData", JSON.stringify(state.checkIn));
      formData.append("scores", JSON.stringify(state.scores));

      const result = await submitChatMessage(formData);
      
      if (result.status === "success" && result.answer) {
        setState((prevState) => ({
          ...prevState,
          chatHistory: [
            ...prevState.chatHistory,
            { role: "assistant", content: result.answer! },
          ],
        }));
      } else {
         setState((prevState) => ({
          ...prevState,
          chatHistory: [
            ...prevState.chatHistory,
            { role: "assistant", content: result.error || "Sorry, something went wrong." },
          ],
        }));
      }
    });
  };

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
          <ScoreCard scores={state.scores} history={state.scoreHistory} />
          
          {/* Recommendations - Stack on mobile, side-by-side on tablet+ */}
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
            <RecommendationsCard 
              title="Today's Recommendations" 
              recommendations={state.recommendations.personalized} 
            />
            <RecommendationsCard 
              title="Habit Tools" 
              recommendations={state.recommendations.habitTools} 
            />
          </div>
          
          {/* AI Coach Card - Full width */}
          <AiCoachCard
            chatHistory={state.chatHistory}
            onSubmit={handleChatSubmit}
            isPending={isPending}
          />
        </div>
      </div>
    </div>
  );
}
