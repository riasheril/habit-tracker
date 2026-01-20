'use server';

import pool from '@/lib/db';
import { Habit, ActionResult } from '@/types';
import { getHabitCount } from '@/lib/queries/habits';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUser } from '@/lib/user-utils';

/**
 * Create a new habit
 * Validates: non-empty name, max 10 habits per user
 */
export async function createHabit(name: string): Promise<ActionResult<Habit>> {
  try {
    // Authenticate user
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get or create user in our database
    const user = await getOrCreateUser(clerkUserId, ''); // Email will be fetched from Clerk if needed

    // Validate name
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return { success: false, error: 'Habit name cannot be empty' };
    }

    // Check 10-habit limit (server-side validation) for this user
    const count = await getHabitCount(user.id);
    if (count >= 10) {
      return { success: false, error: 'Maximum 10 habits allowed' };
    }

    // Insert habit with user_id
    const result = await pool.query(
      'INSERT INTO habits (name, user_id) VALUES ($1, $2) RETURNING *',
      [trimmedName, user.id]
    );

    const habit = result.rows[0] as Habit;

    // Revalidate cache
    revalidatePath('/home');

    return { success: true, data: habit };
  } catch (error) {
    console.error('createHabit error:', error);
    return { success: false, error: 'Failed to create habit' };
  }
}

/**
 * Delete a habit (CASCADE deletes all completions)
 */
export async function deleteHabit(id: number): Promise<ActionResult<void>> {
  try {
    // Authenticate user
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get user from database
    const user = await getOrCreateUser(clerkUserId, '');

    // Delete habit only if it belongs to this user
    const result = await pool.query(
      'DELETE FROM habits WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, user.id]
    );

    if (result.rowCount === 0) {
      return { success: false, error: 'Habit not found' };
    }

    // Revalidate cache
    revalidatePath('/home');

    return { success: true, data: undefined };
  } catch (error) {
    console.error('deleteHabit error:', error);
    return { success: false, error: 'Failed to delete habit' };
  }
}
