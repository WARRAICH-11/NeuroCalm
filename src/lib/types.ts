export type CheckInData = {
  mood: number;
  sleep: number;
  diet: string;
  exercise: string;
  stressors: string;
  userGoals: string;
};

export type Score = {
  calmIndex: number;
  productivityIndex: number;
};

export type ScoreHistoryItem = Score & {
  date: string;
};

export type Recommendations = {
  personalized: string[];
  habitTools: string[];
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type DailyState = {
  checkIn: CheckInData;
  scores: Score;
  scoreHistory: ScoreHistoryItem[];
  recommendations: Recommendations;
  chatHistory: ChatMessage[];
  userGoals: string;
};
