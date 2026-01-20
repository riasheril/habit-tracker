import pool from '@/lib/db';
import { Habit, HabitWithCompletions, HabitCompletion } from '@/types';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUser } from '@/lib/user-utils';

/**
 * Get all habits with their completions for a date range
 * Uses a single JOIN query to avoid N+1 problem
 * Filters by authenticated user
 */
export async function getHabitsWithCompletions(
  startDate?: string,
  endDate?: string
): Promise<HabitWithCompletions[]> {
  // Authenticate user
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return [];
  }

  // Get user from database
  const user = await getOrCreateUser(clerkUserId, '');

  let query = `
    SELECT
      h.id, h.name, h.created_at,
      hc.id as completion_id,
      hc.completion_date,
      hc.completed,
      hc.created_at as completion_created_at
    FROM habits h
    LEFT JOIN habit_completions hc ON h.id = hc.habit_id
    WHERE h.user_id = $1
  `;

  const params: any[] = [user.id];

  if (startDate && endDate) {
    query += ` AND (hc.completion_date BETWEEN $2 AND $3 OR hc.completion_date IS NULL)`;
    params.push(startDate, endDate);
  }

  query += ` ORDER BY h.created_at DESC, hc.completion_date DESC`;

  const result = await pool.query(query, params);

  // Group results by habit
  const habitsMap = new Map<number, HabitWithCompletions>();

  for (const row of result.rows) {
    if (!habitsMap.has(row.id)) {
      habitsMap.set(row.id, {
        id: row.id,
        name: row.name,
        created_at: row.created_at,
        completions: []
      });
    }

    if (row.completion_id) {
      habitsMap.get(row.id)!.completions.push({
        id: row.completion_id,
        habit_id: row.id,
        completion_date: row.completion_date,
        completed: row.completed,
        created_at: row.completion_created_at
      });
    }
  }

  return Array.from(habitsMap.values());
}

/**
 * Get the count of existing habits for a user
 */
export async function getHabitCount(userId?: number): Promise<number> {
  // If userId is provided, use it directly (for Server Actions)
  if (userId) {
    const result = await pool.query('SELECT COUNT(*) FROM habits WHERE user_id = $1', [userId]);
    return parseInt(result.rows[0]?.count || '0', 10);
  }

  // Otherwise, authenticate and get user
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return 0;
  }

  const user = await getOrCreateUser(clerkUserId, '');
  const result = await pool.query('SELECT COUNT(*) FROM habits WHERE user_id = $1', [user.id]);
  return parseInt(result.rows[0]?.count || '0', 10);
}
