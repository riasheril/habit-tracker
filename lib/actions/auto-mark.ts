'use server';

import pool from '@/lib/db';
import { getPastUnloggedDaysInCurrentWeek } from '@/lib/auto-mark-incomplete';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUser } from '@/lib/user-utils';

/**
 * Auto-mark unlogged past days in the current week as incomplete
 * This runs when the user loads the home page
 */
export async function autoMarkIncompleteForCurrentWeek() {
  try {
    // Authenticate user
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get user from database
    const user = await getOrCreateUser(clerkUserId, '');

    // Get all habits for this user
    const habitsResult = await pool.query(
      'SELECT id FROM habits WHERE user_id = $1 ORDER BY created_at ASC',
      [user.id]
    );
    const habits = habitsResult.rows;

    if (habits.length === 0) {
      return { success: true, markedCount: 0 };
    }

    // Get all completions for this user's habits
    const completionsResult = await pool.query(
      `SELECT hc.habit_id, hc.completion_date, hc.completed
       FROM habit_completions hc
       JOIN habits h ON hc.habit_id = h.id
       WHERE h.user_id = $1`,
      [user.id]
    );
    const allCompletions = completionsResult.rows;

    let totalMarked = 0;

    // For each habit, find unlogged past days in current week
    for (const habit of habits) {
      const daysToMark = getPastUnloggedDaysInCurrentWeek(habit.id, allCompletions);

      // Insert completion records as "not-completed" for these days
      for (const date of daysToMark) {
        await pool.query(
          `INSERT INTO habit_completions (habit_id, completion_date, completed)
           VALUES ($1, $2, $3)
           ON CONFLICT (habit_id, completion_date) DO NOTHING`,
          [habit.id, date, false]
        );
        totalMarked++;
      }
    }

    return { success: true, markedCount: totalMarked };
  } catch (error) {
    console.error('Error auto-marking incomplete:', error);
    return { success: false, error: 'Failed to auto-mark incomplete days' };
  }
}
