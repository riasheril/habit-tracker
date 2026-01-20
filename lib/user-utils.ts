import pool from './db';
import { clerkClient } from '@clerk/nextjs/server';

export interface User {
  id: number;
  clerk_user_id: string;
  email: string;
  username: string | null;
  created_at: Date;
}

/**
 * Get user by Clerk user ID
 * Returns null if user doesn't exist
 */
export async function getUserByClerkId(clerkUserId: string): Promise<User | null> {
  const result = await pool.query<User>(
    'SELECT * FROM users WHERE clerk_user_id = $1',
    [clerkUserId]
  );

  return result.rows[0] || null;
}

/**
 * Get or create user from Clerk authentication
 * This is called on every authenticated request to ensure user exists in our DB
 * Email is fetched from Clerk if not provided
 */
export async function getOrCreateUser(clerkUserId: string, email?: string): Promise<User> {
  // Try to get existing user
  let user = await getUserByClerkId(clerkUserId);

  if (user) {
    return user;
  }

  // If email not provided, fetch from Clerk
  let userEmail = email;
  if (!userEmail) {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkUserId);
    userEmail = clerkUser.emailAddresses[0]?.emailAddress || `${clerkUserId}@clerk.user`;
  }

  // Create new user if doesn't exist
  const result = await pool.query<User>(
    `INSERT INTO users (clerk_user_id, email)
     VALUES ($1, $2)
     ON CONFLICT (clerk_user_id) DO UPDATE SET email = EXCLUDED.email
     RETURNING *`,
    [clerkUserId, userEmail]
  );

  return result.rows[0];
}

/**
 * Update username for a user (called during onboarding)
 * Returns true if successful, false if username is already taken
 */
export async function updateUsername(clerkUserId: string, username: string): Promise<boolean> {
  try {
    await pool.query(
      'UPDATE users SET username = $1 WHERE clerk_user_id = $2',
      [username, clerkUserId]
    );
    return true;
  } catch (error: any) {
    // Check if error is due to unique constraint violation
    if (error.code === '23505') {
      return false; // Username already taken
    }
    throw error;
  }
}

/**
 * Check if username is available
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const result = await pool.query(
    'SELECT id FROM users WHERE username = $1',
    [username]
  );

  return result.rows.length === 0;
}
