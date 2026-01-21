'use client';

import { useState } from 'react';
import { GroupDetailWithMembers, MemberHabitProgress } from '@/types';
import Link from 'next/link';
import GroupInfoModal from './group-info-modal';

interface GroupDetailViewProps {
  group: GroupDetailWithMembers;
}

export default function GroupDetailView({ group }: GroupDetailViewProps) {
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  // Group member progress by user
  const memberProgressByUser = new Map<number, MemberHabitProgress[]>();
  for (const progress of group.member_progress) {
    if (!memberProgressByUser.has(progress.user_id)) {
      memberProgressByUser.set(progress.user_id, []);
    }
    memberProgressByUser.get(progress.user_id)!.push(progress);
  }

  return (
    <div className="min-h-screen pb-6 bg-gray-50">
      {/* Sticky Header Section */}
      <div className="sticky top-0 bg-gray-50 z-20 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/groups"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Groups</span>
          </Link>

          {/* Clickable Group Header */}
          <button
            onClick={() => setShowGroupInfo(true)}
            className="w-full bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Tap for info</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Member Progress Section */}
      <div className="max-w-4xl mx-auto px-6">
        {/* Sticky Member Progress Header */}
        <div className="sticky top-[140px] bg-gray-50 z-10 py-4">
          <h2 className="text-xl font-bold text-gray-900">Member Progress</h2>
        </div>

        <div>
          {group.member_progress.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">No habits tracked yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Members will appear here once they start tracking habits
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Array.from(memberProgressByUser.entries()).map(([userId, progressList]) => {
                const firstProgress = progressList[0];
                if (!firstProgress) return null;

                return (
                  <div key={userId} className="bg-white rounded-lg shadow p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {firstProgress.username || firstProgress.email}
                    </h3>
                    <div className="space-y-3">
                      {progressList.map((progress) => (
                        <div key={progress.habit_id} className="border-l-4 border-emerald-500 pl-4">
                          <p className="font-medium text-gray-900">{progress.habit_name}</p>
                          <div className="grid grid-cols-3 gap-4 mt-2">
                            <div>
                              <p className="text-xs text-gray-600">Current Streak</p>
                              <p className="text-lg font-semibold text-orange-600">
                                {progress.current_streak} days
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">This Week</p>
                              <p className="text-lg font-semibold text-blue-600">
                                {progress.weekly_completed}/{progress.weekly_total}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">This Month</p>
                              <p className="text-lg font-semibold text-purple-600">
                                {progress.monthly_completed}/{progress.monthly_total}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Group Info Modal */}
      <GroupInfoModal
        group={group}
        isOpen={showGroupInfo}
        onClose={() => setShowGroupInfo(false)}
      />
    </div>
  );
}
