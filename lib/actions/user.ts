'use server';

import { isUsernameAvailable as checkUsername, updateUsername as updateUserUsername } from '../user-utils';
import { clerkClient } from '@clerk/nextjs/server';

export async function checkUsernameAvailability(username: string): Promise<boolean> {
  return await checkUsername(username);
}

export async function updateUserUsernameAction(clerkUserId: string, username: string): Promise<boolean> {
  const success = await updateUserUsername(clerkUserId, username);

  if (success) {
    // Update Clerk metadata to mark onboarding as complete
    const client = await clerkClient();
    await client.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        hasCompletedOnboarding: true,
      },
    });
  }

  return success;
}
