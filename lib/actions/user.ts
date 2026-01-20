'use server';

import { isUsernameAvailable as checkUsername, updateUsername as updateUserUsername } from '../user-utils';

export async function checkUsernameAvailability(username: string): Promise<boolean> {
  return await checkUsername(username);
}

export async function updateUserUsernameAction(clerkUserId: string, username: string): Promise<boolean> {
  return await updateUserUsername(clerkUserId, username);
}
