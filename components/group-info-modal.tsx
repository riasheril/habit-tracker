'use client';

import { useState, useTransition } from 'react';
import { GroupDetailWithMembers } from '@/types';
import { leaveGroup, removeMember, regenerateInviteCode } from '@/lib/actions/groups';
import { useRouter } from 'next/navigation';
import ConfirmationModal from './confirmation-modal';

interface GroupInfoModalProps {
  group: GroupDetailWithMembers;
  isOpen: boolean;
  onClose: () => void;
}

export default function GroupInfoModal({ group, isOpen, onClose }: GroupInfoModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ id: number; name: string } | null>(null);
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const router = useRouter();

  const isOwner = group.current_user_role === 'owner';

  if (!isOpen) return null;

  const handleLeaveGroup = () => {
    setError(null);
    startTransition(async () => {
      const result = await leaveGroup(group.id);
      if (result.success) {
        router.push('/groups');
      } else {
        setError(result.error);
      }
    });
  };

  const handleRemoveMember = (userId: number, username: string | null, email: string) => {
    setMemberToRemove({ id: userId, name: username || email });
    setShowRemoveModal(true);
  };

  const handleRemoveMemberConfirmed = () => {
    if (!memberToRemove) return;

    setError(null);
    startTransition(async () => {
      const result = await removeMember(group.id, memberToRemove.id);
      if (!result.success) {
        setError(result.error);
      }
      setMemberToRemove(null);
    });
  };

  const handleCopyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/groups?invite=${group.invite_code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const handleRegenerateInvite = () => {
    setError(null);
    startTransition(async () => {
      const result = await regenerateInviteCode(group.id);
      if (!result.success) {
        setError(result.error);
      } else {
        setShowInviteLink(false);
        setTimeout(() => setShowInviteLink(true), 100);
      }
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-4">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[95vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 rounded-t-lg">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{group.name}</h2>
              <p className="text-sm text-gray-600">
                {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {/* Members Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Members
              </h3>
              <div className="space-y-2">
                {group.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {member.username || member.email}
                      </p>
                      {member.username && (
                        <p className="text-sm text-gray-600">{member.email}</p>
                      )}
                      {member.role === 'owner' && (
                        <span className="inline-block mt-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                          Owner
                        </span>
                      )}
                    </div>
                    {isOwner && member.role !== 'owner' && (
                      <button
                        onClick={() => handleRemoveMember(member.user_id, member.username, member.email)}
                        className="ml-3 text-red-600 hover:text-red-700 text-sm font-medium"
                        disabled={isPending}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Invite Link Section (Owner Only) */}
            {isOwner && (
              <div className="mb-6">
                <button
                  onClick={() => setShowInviteLink(!showInviteLink)}
                  className="w-full flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span className="font-medium text-emerald-700">
                      {showInviteLink ? 'Hide Invite Link' : 'Show Invite Link'}
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-emerald-700 transition-transform ${showInviteLink ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showInviteLink && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      Share this link with people you want to invite:
                    </p>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/groups?invite=${group.invite_code}`}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                      />
                      <button
                        onClick={handleCopyInviteLink}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        {copiedInvite ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <button
                      onClick={handleRegenerateInvite}
                      className="w-full px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                      disabled={isPending}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Generate New Link</span>
                      </div>
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Generating a new link will invalidate the old one
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Leave/Delete Group Button */}
            <button
              onClick={() => setShowLeaveModal(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              disabled={isPending}
            >
              {isOwner ? 'Delete Group' : 'Leave Group'}
            </button>
          </div>
        </div>
      </div>

      {/* Leave/Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onConfirm={handleLeaveGroup}
        title={isOwner ? 'Delete Group' : 'Leave Group'}
        message={
          isOwner
            ? `Are you sure you want to delete "${group.name}"? This will remove all members and cannot be undone.`
            : `Are you sure you want to leave "${group.name}"?`
        }
        confirmText="Yes"
        cancelText="No"
        isDangerous={true}
      />

      {/* Remove Member Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRemoveModal}
        onClose={() => {
          setShowRemoveModal(false);
          setMemberToRemove(null);
        }}
        onConfirm={handleRemoveMemberConfirmed}
        title="Remove Member"
        message={`Are you sure you want to remove ${memberToRemove?.name} from this group?`}
        confirmText="Remove"
        cancelText="Cancel"
        isDangerous={true}
      />
    </>
  );
}
