import pool from '@/lib/db';
import { HabitCompletion } from '@/types';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUser } from '@/lib/user-utils';

/**
 * Get a specific completion for a habit on a specific date
 * Verifies the habit belongs to the authenticated user
 */
export async function getCompletionForDate(
  habitId: number,
  date: string
): Promise<HabitCompletion | null> {
  // Authenticate user
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return null;
  }

  // Get user from database
  const user = await getOrCreateUser(clerkUserId, '');

  // Join with habits to verify user ownership
  const result = await pool.query(
    `SELECT hc.* FROM habit_completions hc
     JOIN habits h ON hc.habit_id = h.id
     WHERE hc.habit_id = $1 AND hc.completion_date = $2 AND h.user_id = $3`,
    [habitId, date, user.id]
  );

  return result.rows[0] || null;
}
