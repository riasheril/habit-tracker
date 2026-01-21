import pool from '@/lib/db';
import {
  GroupWithMemberCount,
  GroupDetailWithMembers,
  GroupMemberWithUser,
  MemberHabitProgress
} from '@/types';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUser } from '@/lib/user-utils';
import { calculateStreak } from '@/lib/streak-calculator';
import { getMonthlyPercentage } from '@/lib/completion-utils';
import { startOfWeek, endOfWeek, formatDateForDb } from '@/lib/date-utils';

/**
 * Get all groups the current user is a member of
 * Returns groups with member count and user's role
 */
export async function getUserGroups(): Promise<GroupWithMemberCount[]> {
  // Authenticate user
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return [];
  }

  const user = await getOrCreateUser(clerkUserId, '');

  const result = await pool.query(
    `SELECT
      g.id,
      g.name,
      g.owner_user_id,
      g.invite_code,
      g.created_at,
      gm.role as user_role,
      COUNT(gm2.id) as member_count
    FROM groups g
    JOIN group_members gm ON g.id = gm.group_id AND gm.user_id = $1
    LEFT JOIN group_members gm2 ON g.id = gm2.group_id
    GROUP BY g.id, g.name, g.owner_user_id, g.invite_code, g.created_at, gm.role
    ORDER BY g.created_at DESC`,
    [user.id]
  );

  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    owner_user_id: row.owner_user_id,
    invite_code: row.invite_code,
    created_at: row.created_at,
    member_count: parseInt(row.member_count, 10),
    user_role: row.user_role
  }));
}

/**
 * Get detailed group information with all members and their habit progress
 * Verifies user is a member of the group
 */
export async function getGroupDetail(groupId: number): Promise<GroupDetailWithMembers | null> {
  // Authenticate user
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return null;
  }

  const user = await getOrCreateUser(clerkUserId, '');

  // Verify user is a member of this group
  const membershipCheck = await pool.query(
    'SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2',
    [groupId, user.id]
  );

  if (membershipCheck.rows.length === 0) {
    return null; // User is not a member
  }

  const currentUserRole = membershipCheck.rows[0].role;

  // Get group details
  const groupResult = await pool.query(
    'SELECT * FROM groups WHERE id = $1',
    [groupId]
  );

  if (groupResult.rows.length === 0) {
    return null;
  }

  const group = groupResult.rows[0];

  // Get all members with user details
  const membersResult = await pool.query(
    `SELECT
      gm.id,
      gm.group_id,
      gm.user_id,
      gm.role,
      gm.joined_at,
      u.username,
      u.email
    FROM group_members gm
    JOIN users u ON gm.user_id = u.id
    WHERE gm.group_id = $1
    ORDER BY gm.role DESC, gm.joined_at ASC`,
    [groupId]
  );

  const members: GroupMemberWithUser[] = membersResult.rows;

  // Get all habits and completions for all members
  // Use LEFT JOIN to avoid N+1 queries
  const memberProgressResult = await pool.query(
    `SELECT
      h.id as habit_id,
      h.name as habit_name,
      h.user_id,
      u.username,
      u.email,
      hc.id as completion_id,
      hc.completion_date,
      hc.completed
    FROM group_members gm
    JOIN users u ON gm.user_id = u.id
    LEFT JOIN habits h ON h.user_id = u.id
    LEFT JOIN habit_completions hc ON hc.habit_id = h.id
    WHERE gm.group_id = $1
    ORDER BY u.username ASC, h.name ASC, hc.completion_date DESC`,
    [groupId]
  );

  // Process the flat result into structured data
  // Group by user -> habit -> completions
  const userHabitsMap = new Map<number, Map<number, any>>();

  for (const row of memberProgressResult.rows) {
    if (!row.habit_id) continue; // Skip users with no habits

    if (!userHabitsMap.has(row.user_id)) {
      userHabitsMap.set(row.user_id, new Map());
    }

    const userHabits = userHabitsMap.get(row.user_id)!;

    if (!userHabits.has(row.habit_id)) {
      userHabits.set(row.habit_id, {
        habit_id: row.habit_id,
        habit_name: row.habit_name,
        user_id: row.user_id,
        username: row.username,
        email: row.email,
        completions: []
      });
    }

    if (row.completion_id) {
      userHabits.get(row.habit_id)!.completions.push({
        id: row.completion_id,
        habit_id: row.habit_id,
        completion_date: row.completion_date,
        completed: row.completed
      });
    }
  }

  // Calculate progress metrics for each habit
  const memberProgress: MemberHabitProgress[] = [];

  for (const [userId, habitsMap] of userHabitsMap) {
    for (const [habitId, habitData] of habitsMap) {
      const completions = habitData.completions;

      // Calculate current streak
      const currentStreak = calculateStreak(completions);

      // Calculate weekly progress (current week)
      const today = new Date();
      const weekStart = startOfWeek(today);
      const weekEnd = endOfWeek(today);

      const weekCompletions = completions.filter((c: any) => {
        const date = new Date(c.completion_date);
        return date >= weekStart && date <= weekEnd && c.completed === true;
      });

      const weeklyCompleted = weekCompletions.length;
      const weeklyTotal = 7;

      // Calculate monthly progress (current month)
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      const monthCompletions = completions.filter((c: any) => {
        if (c.completed !== true) return false;
        const date = new Date(c.completion_date);
        return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
      });

      const monthlyCompleted = monthCompletions.length;
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const monthlyTotal = daysInMonth;

      memberProgress.push({
        user_id: userId,
        username: habitData.username,
        email: habitData.email,
        habit_id: habitId,
        habit_name: habitData.habit_name,
        current_streak: currentStreak,
        weekly_completed: weeklyCompleted,
        weekly_total: weeklyTotal,
        monthly_completed: monthlyCompleted,
        monthly_total: monthlyTotal
      });
    }
  }

  return {
    id: group.id,
    name: group.name,
    owner_user_id: group.owner_user_id,
    invite_code: group.invite_code,
    created_at: group.created_at,
    members,
    member_progress: memberProgress,
    current_user_role: currentUserRole
  };
}
