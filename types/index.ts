export interface Habit {
  id: number;
  name: string;
  created_at: Date | string;
}

export interface HabitCompletion {
  id: number;
  habit_id: number;
  completion_date: string; // YYYY-MM-DD format
  completed: boolean;
  created_at: Date | string;
}

export type CompletionStatus = 'completed' | 'not-completed' | 'unlogged';

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface HabitWithCompletions extends Habit {
  completions: HabitCompletion[];
}
