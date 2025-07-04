
export interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified: boolean;
}

export interface JournalEntry {
  id: string; // Firestore document ID
  userId: string;
  date: string; // ISO string
  content: string;
  moodRating: number; // 1-10
}

export interface Helpline {
  id: string;
  name: string;
  number: string;
  description?: string;
  logo?: string; // URL to an icon/logo if available
}

export interface MoodAnalysisResult {
  moodRating: number;
  moodKeywords: string;
  suggestedSolutions: string;
}

export interface WellbeingTip {
  wellbeingTips: string;
}

// New types for Mood Trend Analysis
export interface MoodTrendEntry {
  date: string; // e.g., "MMM d, yyyy"
  moodRating: number;
}

export interface MoodTrendAnalysisInput {
  recentMoods: MoodTrendEntry[];
}

export interface MoodTrendAnalysisResult {
  trendAnalysis: string;
}
