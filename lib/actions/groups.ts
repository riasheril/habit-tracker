'use server';

import pool from '@/lib/db';
import { Group, GroupMember, ActionResult } from '@/types';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUser } from '@/lib/user-utils';
import { randomBytes } from 'crypto';

/**
 * Generate a unique invite code for a group
 */
function generateInviteCode(): string {
  return randomBytes(16).toString('hex'); // 32 character hex string
}

/**
 * Create a new group
 * Creator automatically becomes owner and is added to group_members
 */
export async function createGroup(name: string): Promise<ActionResult<Group>> {
  try {
    // Authenticate user
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await getOrCreateUser(clerkUserId, '');

    // Validate name
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return { success: false, error: 'Group name cannot be empty' };
    }

    if (trimmedName.length > 100) {
      return { success: false, error: 'Group name must be 100 characters or less' };
    }

    // Generate unique invite code
    const inviteCode = generateInviteCode();

    // Use a transaction to create group and add owner as member
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create group
      const groupResult = await client.query(
        'INSERT INTO groups (name, owner_user_id, invite_code) VALUES ($1, $2, $3) RETURNING *',
        [trimmedName, user.id, inviteCode]
      );

      const group = groupResult.rows[0] as Group;

      // Add owner as a member with role='owner'
      await client.query(
        'INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, $3)',
        [group.id, user.id, 'owner']
      );

      await client.query('COMMIT');

      // Revalidate cache
      revalidatePath('/groups');

      return { success: true, data: group };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('createGroup error:', error);
    return { success: false, error: 'Failed to create group' };
  }
}

/**
 * Join a group via invite code
 */
export async function joinGroup(inviteCode: string): Promise<ActionResult<GroupMember>> {
  try {
    // Authenticate user
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await getOrCreateUser(clerkUserId, '');

    // Validate invite code
    const trimmedCode = inviteCode.trim();
    if (trimmedCode.length === 0) {
      return { success: false, error: 'Invite code cannot be empty' };
    }

    // Find group by invite code
    const groupResult = await pool.query(
      'SELECT * FROM groups WHERE invite_code = $1',
      [trimmedCode]
    );

    if (groupResult.rows.length === 0) {
      return { success: false, error: 'Invalid invite code' };
    }

    const group = groupResult.rows[0] as Group;

    // Check if user is already a member
    const existingMember = await pool.query(
      'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2',
      [group.id, user.id]
    );

    if (existingMember.rows.length > 0) {
      return { success: false, error: 'You are already a member of this group' };
    }

    // Add user as member
    const memberResult = await pool.query(
      'INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, $3) RETURNING *',
      [group.id, user.id, 'member']
    );

    const member = memberResult.rows[0] as GroupMember;

    // Revalidate cache
    revalidatePath('/groups');
    revalidatePath(`/groups/${group.id}`);

    return { success: true, data: member };
  } catch (error: any) {
    console.error('joinGroup error:', error);

    // Handle unique constraint violation (shouldn't happen due to check above, but just in case)
    if (error.code === '23505') {
      return { success: false, error: 'You are already a member of this group' };
    }

    return { success: false, error: 'Failed to join group' };
  }
}

/**
 * Leave a group (or delete group if owner)
 * If owner leaves, the entire group is deleted
 */
export async function leaveGroup(groupId: number): Promise<ActionResult<void>> {
  try {
    // Authenticate user
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await getOrCreateUser(clerkUserId, '');

    // Check user's membership and role
    const memberResult = await pool.query(
      'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, user.id]
    );

    if (memberResult.rows.length === 0) {
      return { success: false, error: 'You are not a member of this group' };
    }

    const member = memberResult.rows[0] as GroupMember;

    if (member.role === 'owner') {
      // Owner leaving = delete entire group (CASCADE will delete all members)
      const deleteResult = await pool.query(
        'DELETE FROM groups WHERE id = $1 AND owner_user_id = $2 RETURNING *',
        [groupId, user.id]
      );

      if (deleteResult.rowCount === 0) {
        return { success: false, error: 'Failed to delete group' };
      }
    } else {
      // Regular member leaving = just delete their membership
      const deleteResult = await pool.query(
        'DELETE FROM group_members WHERE group_id = $1 AND user_id = $2',
        [groupId, user.id]
      );

      if (deleteResult.rowCount === 0) {
        return { success: false, error: 'Failed to leave group' };
      }
    }

    // Revalidate cache
    revalidatePath('/groups');
    revalidatePath(`/groups/${groupId}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error('leaveGroup error:', error);
    return { success: false, error: 'Failed to leave group' };
  }
}

/**
 * Remove a member from a group (owner only)
 * Owner cannot remove themselves - they must use leaveGroup
 */
export async function removeMember(groupId: number, memberUserId: number): Promise<ActionResult<void>> {
  try {
    // Authenticate user
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await getOrCreateUser(clerkUserId, '');

    // Verify current user is the owner
    const ownerCheck = await pool.query(
      'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2 AND role = $3',
      [groupId, user.id, 'owner']
    );

    if (ownerCheck.rows.length === 0) {
      return { success: false, error: 'Only the group owner can remove members' };
    }

    // Prevent owner from removing themselves
    if (memberUserId === user.id) {
      return { success: false, error: 'Owner cannot remove themselves. Use "Leave Group" to delete the group.' };
    }

    // Remove the member
    const deleteResult = await pool.query(
      'DELETE FROM group_members WHERE group_id = $1 AND user_id = $2 AND role = $3',
      [groupId, memberUserId, 'member']
    );

    if (deleteResult.rowCount === 0) {
      return { success: false, error: 'Member not found or is the group owner' };
    }

    // Revalidate cache
    revalidatePath(`/groups/${groupId}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error('removeMember error:', error);
    return { success: false, error: 'Failed to remove member' };
  }
}

/**
 * Regenerate invite code for a group (owner only)
 * Useful if the invite link has been shared publicly and needs to be revoked
 */
export async function regenerateInviteCode(groupId: number): Promise<ActionResult<string>> {
  try {
    // Authenticate user
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await getOrCreateUser(clerkUserId, '');

    // Verify user is owner
    const ownerCheck = await pool.query(
      'SELECT * FROM groups WHERE id = $1 AND owner_user_id = $2',
      [groupId, user.id]
    );

    if (ownerCheck.rows.length === 0) {
      return { success: false, error: 'Only the group owner can regenerate invite codes' };
    }

    // Generate new invite code
    const newInviteCode = generateInviteCode();

    // Update group
    const updateResult = await pool.query(
      'UPDATE groups SET invite_code = $1 WHERE id = $2 RETURNING invite_code',
      [newInviteCode, groupId]
    );

    if (updateResult.rows.length === 0) {
      return { success: false, error: 'Failed to regenerate invite code' };
    }

    // Revalidate cache
    revalidatePath(`/groups/${groupId}`);

    return { success: true, data: newInviteCode };
  } catch (error) {
    console.error('regenerateInviteCode error:', error);
    return { success: false, error: 'Failed to regenerate invite code' };
  }
}
