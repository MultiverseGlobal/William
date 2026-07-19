export interface Command {
  id: string;
  user_id: string;
  title: string;
  reason: string;
  estimated_minutes: number;
  status: 'active' | 'completed' | 'delayed' | 'skipped';
  ignored_count: number;
  issued_at: string;
  completed_at: string | null;
  context_snapshot: Record<string, any> | null;
}

export type ConstitutionCategory = 'sleep' | 'health' | 'work' | 'recovery' | 'priority';

export interface ConstitutionRule {
  id: string;
  user_id: string;
  rule_text: string;
  category: ConstitutionCategory;
  is_active: boolean;
  created_at: string;
}

export interface TaskItem {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'completed';
  due_date?: string;
  source: 'notion' | 'github' | 'manual';
  source_id?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
}

export interface ContextState {
  id: string;
  user_id: string;
  current_energy: number; // 1-10
  focus_score: number; // 1-10
  tasks_today: TaskItem[];
  meetings_today: CalendarEvent[];
  goals: string[];
  last_updated_at: string;
}

export interface Integration {
  id: string;
  user_id: string;
  provider: 'google' | 'notion' | 'github' | 'gmail';
  connected: boolean;
  connected_at: string;
  last_synced_at: string | null;
}

export interface DailyBrief {
  id: string;
  user_id: string;
  type: 'morning' | 'evening';
  content: {
    objective: string;
    meetings: string[];
    risks: string[];
    completed_work?: string[];
    missed_work?: string[];
    tomorrow_priority?: string;
  };
  generated_at: string;
  acknowledged_at: string | null;
}

export interface ReasoningRequest {
  context: Partial<ContextState>;
  constitution: ConstitutionRule[];
  mission: string;
  instruction: string;
}

export interface ReasoningResponse {
  command: {
    title: string;
    reason: string;
    estimated_minutes: number;
  };
  rationale: string;
  confidence: number;
  meta?: Record<string, any>;
}

export interface Portrait {
  name: string;
  identity: string;         // Who you are trying to become
  values: string;           // Why does that matter & What gives life meaning
  principles: string;       // Guiding principles
  strengths: string;        // Strengths you rely on
  blind_spots: string;      // Fears / struggles / weaknesses / blind spots
  dreams: string;           // Ambitions / projects / what you are building
  relationships: string;    // Crucial relationships & circle
  decision_patterns: string[]; // Decision patterns noticed
  growth: string[];         // Chronological growth / biography logs
  cognitiveProfile: {
    problemSolvingStyle: string;
    temporalBias: string;
    attentionSpan: string;
    decisionHeuristics: string;
  };
  activeBeliefs: Array<{
    belief: string;
    strength: number; // 0.0 to 1.0 representation
    lastTested: string;
    evolution: string;
  }>;
}

export interface Journey {
  id: string;
  category: 'mental' | 'physical' | 'financial' | 'relationships' | 'legacy';
  icon: string;
  title: string;
  currentState: string;
  vision: string;
  milestones: Array<{ id: string; text: string; completed: boolean }>;
  memories: string[];
  lessons: string[];
  progress: number; // 0-100 percentage
  timeline: Array<{ date: string; text: string }>;
}

export interface LibraryItem {
  id: string;
  type: 'book' | 'idea' | 'quote' | 'note' | 'lesson';
  title: string;
  author?: string;
  content: string;
  dateAdded: string;
  tags: string[];
}


