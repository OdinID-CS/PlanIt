export interface Task {
  title: string;
  description: string;
  resources: string[];
  completed: boolean;
}

export interface DayPlan {
  dayNumber: number;
  dayTitle: string;
  focus: string;
  estimatedTime: string;
  tasks: Task[];
  dailyTip: string;
  notes?: string; // Optional user notes for this day
}

export interface StudyPlan {
  id: string;
  title: string;
  summary: string;
  intensity: string;
  milestones: string[];
  days: DayPlan[];
  createdAt: string;
  goal: string;
  timeframe: number;
  timeframeUnit: string;
  knowledgeLevel: string;
  learningStyle: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
