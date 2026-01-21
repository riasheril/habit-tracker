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

// Groups feature types
export interface Group {
  id: number;
  name: string;
  owner_user_id: number;
  invite_code: string;
  created_at: Date | string;
}

export interface GroupMember {
  id: number;
  group_id: number;
  user_id: number;
  role: 'owner' | 'member';
  joined_at: Date | string;
}

export interface GroupMemberWithUser extends GroupMember {
  username: string | null;
  email: string;
}

export interface GroupWithMemberCount extends Group {
  member_count: number;
  user_role: 'owner' | 'member';
}

export interface MemberHabitProgress {
  user_id: number;
  username: string | null;
  email: string;
  habit_id: number;
  habit_name: string;
  current_streak: number;
  weekly_completed: number;
  weekly_total: number;
  monthly_completed: number;
  monthly_total: number;
}

export interface GroupDetailWithMembers {
  id: number;
  name: string;
  owner_user_id: number;
  invite_code: string;
  created_at: Date | string;
  members: GroupMemberWithUser[];
  member_progress: MemberHabitProgress[];
  current_user_role: 'owner' | 'member';
}
