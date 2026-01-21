'use client';

import { useState, useTransition, useEffect } from 'react';
import { GroupWithMemberCount } from '@/types';
import { createGroup, joinGroup } from '@/lib/actions/groups';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface GroupsViewProps {
  groups: GroupWithMemberCount[];
}

export default function GroupsView({ groups }: GroupsViewProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const searchParams = useSearchParams();

  // Auto-open join modal if invite code is in URL
  useEffect(() => {
    const inviteParam = searchParams.get('invite');
    if (inviteParam) {
      setInviteCode(inviteParam);
      setShowJoinModal(true);
    }
  }, [searchParams]);

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      setError('Group name cannot be empty');
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await createGroup(groupName);
      if (result.success) {
        setGroupName('');
        setShowCreateModal(false);
      } else {
        setError(result.error);
      }
    });
  };

  const handleJoinGroup = () => {
    if (!inviteCode.trim()) {
      setError('Invite code cannot be empty');
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await joinGroup(inviteCode);
      if (result.success) {
        setInviteCode('');
        setShowJoinModal(false);
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen pb-6">
      <div className="max-w-4xl mx-auto px-6 pt-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Groups</h1>
          <p className="text-gray-600">Connect with accountability partners</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            Create Group
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            Join Group
          </button>
        </div>

        {/* Groups List */}
        {groups.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">You're not in any groups yet.</p>
            <p className="text-gray-400 text-sm mt-2">Create a group or join one with an invite code!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-600">
                      {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
                      {group.user_role === 'owner' && (
                        <span className="ml-2 text-emerald-600 font-medium">• Owner</span>
                      )}
                    </p>
                  </div>
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Group</h2>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
              disabled={isPending}
            />
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setError(null);
                  setGroupName('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                disabled={isPending}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Group Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowJoinModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Join Group</h2>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Paste invite code"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              disabled={isPending}
            />
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setError(null);
                  setInviteCode('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleJoinGroup}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                disabled={isPending}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
