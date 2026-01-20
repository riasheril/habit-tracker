'use server';

import pool from '@/lib/db';
import { HabitCompletion, ActionResult } from '@/types';
import { revalidateTag } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUser } from '@/lib/user-utils';

/**
 * Log a completion for a habit on a specific date
 * CRITICAL: Handles three-state logic
 * - completed === null: DELETE record (unlogged state)
 * - completed === true/false: UPSERT record
 */
export async function logCompletion(
  habitId: number,
  date: string,
  completed: boolean | null
): Promise<ActionResult<HabitCompletion | null>> {
  try {
    // Authenticate user
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get user from database
    const user = await getOrCreateUser(clerkUserId, '');

    // Verify the habit belongs to this user
    const habitCheck = await pool.query(
      'SELECT id FROM habits WHERE id = $1 AND user_id = $2',
      [habitId, user.id]
    );

    if (habitCheck.rows.length === 0) {
      return { success: false, error: 'Habit not found' };
    }

    if (completed === null) {
      // DELETE the record (back to unlogged state)
      await pool.query(
        'DELETE FROM habit_completions WHERE habit_id = $1 AND completion_date = $2',
        [habitId, date]
      );

      // Revalidate cache
      revalidateTag('habits');

      return { success: true, data: null };
    } else {
      // UPSERT the record
      const result = await pool.query(
        `INSERT INTO habit_completions (habit_id, completion_date, completed)
         VALUES ($1, $2, $3)
         ON CONFLICT (habit_id, completion_date)
         DO UPDATE SET completed = $3
         RETURNING *`,
        [habitId, date, completed]
      );

      const completion = result.rows[0] as HabitCompletion;

      // Revalidate cache
      revalidateTag('habits');

      return { success: true, data: completion };
    }
  } catch (error) {
    console.error('logCompletion error:', error);
    return { success: false, error: 'Failed to log completion' };
  }
}
