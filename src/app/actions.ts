"use server";

import { z } from "zod";
import { analyzeMentalStateAndProvideScores } from "@/ai/flows/analyze-mental-state-and-provide-scores";
import { providePersonalizedRecommendations } from "@/ai/flows/provide-personalized-recommendations";
import { recommendHabitTools } from "@/ai/flows/recommend-habit-tools";
import { answerQuestionsAndProvideGuidance } from "@/ai/flows/answer-questions-and-provide-guidance";
import type { CheckInData, Score, DailyState } from "@/lib/types";

const checkInSchema = z.object({
  mood: z.coerce.number().min(1).max(10),
  sleep: z.coerce.number().min(0).max(24),
  diet: z.string().min(1, "Please describe your diet."),
  exercise: z.string().min(1, "Please describe your exercise."),
  stressors: z.string().min(1, "Please describe your stressors."),
  userGoals: z.string(),
});

export async function submitDailyCheckin(
  currentState: DailyState,
  formData: FormData
): Promise<{
  status: "success" | "error";
  data?: {
    scores: Score;
    personalizedRecommendations: string[];
    habitTools: string[];
  };
  error?: string;
}> {
  const parsed = checkInSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { status: "error", error: "Invalid form data." };
  }

  try {
    const checkInData: CheckInData = parsed.data;

    // 1. Analyze mental state and get scores
    const mentalState = await analyzeMentalStateAndProvideScores({
      mood: checkInData.mood,
      sleep: checkInData.sleep,
      diet: checkInData.diet,
      exercise: checkInData.exercise,
      stressors: checkInData.stressors,
    });

    const scores = {
      calmIndex: mentalState.calmIndex,
      productivityIndex: mentalState.productivityIndex,
    };

    // 2. Get personalized recommendations
    const { recommendations: personalizedRecommendations } =
      await providePersonalizedRecommendations({
        calmIndex: scores.calmIndex,
        productivityIndex: scores.productivityIndex,
        userGoals: checkInData.userGoals,
      });

    // 3. Get habit tool recommendations
    const { recommendations: habitTools } = await recommendHabitTools({
      mood: `${checkInData.mood}/10`,
      sleep: `${checkInData.sleep} hours`,
      diet: checkInData.diet,
      exercise: checkInData.exercise,
      stressors: checkInData.stressors,
      calmIndex: scores.calmIndex,
      productivityIndex: scores.productivityIndex,
    });

    return {
      status: "success",
      data: {
        scores,
        personalizedRecommendations,
        habitTools,
      },
    };
  } catch (error) {
    console.error("AI flow error:", error);
    return { status: "error", error: "Failed to process data. Please try again." };
  }
}

const chatSchema = z.object({
  question: z.string().min(1),
  checkInData: z.object({
    mood: z.coerce.number().min(1).max(10),
    sleep: z.coerce.number().min(0).max(24),
    diet: z.string(),
    exercise: z.string(),
    stressors: z.string(),
  }),
  scores: z.object({
    calmIndex: z.number(),
    productivityIndex: z.number(),
  }),
});

export async function submitChatMessage(
  formData: FormData
): Promise<{ status: "success" | "error"; answer?: string; error?: string }> {
  const question = formData.get("question") as string;
  const checkInData = JSON.parse(formData.get("checkInData") as string);
  const scores = JSON.parse(formData.get("scores") as string);

  const parsed = chatSchema.safeParse({
    question,
    checkInData,
    scores,
  });

  if (!parsed.success) {
    console.error(parsed.error.flatten());
    return { status: "error", error: "Invalid chat data." };
  }

  const { question: userQuestion, checkInData: userCheckIn, scores: userScores } = parsed.data;
  
  // Handle case where user hasn't checked in yet
  if (userCheckIn.diet === '' || userScores.calmIndex === 0) {
      return { status: 'success', answer: "I can answer your questions more effectively once you've completed your daily check-in. Please fill out the check-in form first." };
  }


  try {
    const { answer } = await answerQuestionsAndProvideGuidance({
      question: userQuestion,
      calmIndex: userScores.calmIndex,
      productivityIndex: userScores.productivityIndex,
      mood: `${userCheckIn.mood}/10`,
      sleep: `${userCheckIn.sleep} hours`,
      diet: userCheckIn.diet,
      exercise: userCheckIn.exercise,
      stressors: userCheckIn.stressors,
    });
    return { status: "success", answer };
  } catch (error) {
    console.error("Chat AI flow error:", error);
    return {
      status: "error",
      error: "Sorry, I couldn't process that. Please try again.",
    };
  }
}
