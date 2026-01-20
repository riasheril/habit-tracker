'use client';

import { useState, useTransition } from 'react';
import { HabitWithCompletions } from '@/types';
import { logCompletion } from '@/lib/actions/completions';
import { deleteHabit } from '@/lib/actions/habits';
import { calculateStreak } from '@/lib/streak-calculator';
import { getCompletionStatus } from '@/lib/completion-utils';
import ConfirmationModal from './confirmation-modal';

interface HabitCardProps {
  habit: HabitWithCompletions;
  selectedDate: string;
}

export default function HabitCard({ habit, selectedDate }: HabitCardProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const streak = calculateStreak(habit.completions);
  const status = getCompletionStatus(habit.id, selectedDate, habit.completions);

  const handleLog = (completed: boolean | null) => {
    setError(null);
    startTransition(async () => {
      // If completed is null, explicitly unlog (delete the record)
      // Otherwise, if already in this state, delete the record (back to unlogged)
      const newValue = completed === null
        ? null
        : status === (completed ? 'completed' : 'not-completed') ? null : completed;
      const result = await logCompletion(habit.id, selectedDate, newValue);

      if (!result.success) {
        setError(result.error);
      }
    });
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteHabit(habit.id);

      if (!result.success) {
        setError(result.error);
      }
    });
  };

  // Determine card styling based on completion status
  let cardClasses = 'bg-white rounded-lg shadow p-4 transition-all duration-300';
  if (status === 'completed') {
    cardClasses = 'bg-emerald-50 border-2 border-emerald-500 rounded-lg shadow p-4 transition-all duration-300';
  } else if (status === 'not-completed') {
    cardClasses = 'bg-red-50 border-2 border-red-500 rounded-lg shadow p-4 transition-all duration-300';
  }

  return (
    <div className={cardClasses}>
      <div className="flex items-center justify-between">
        {/* Habit name and streak */}
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900">{habit.name}</h3>
          <p className="text-xs text-orange-600 mt-0.5">
            🔥 {streak}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Unlog button (back arrow) - returns to unlogged state */}
          <button
            onClick={() => handleLog(null)}
            disabled={isPending || status === 'unlogged'}
            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
              status === 'unlogged'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
            }`}
            aria-label="Unlog (reset to unlogged)"
            title="Unlog (reset to unlogged)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          {/* Complete button */}
          <button
            onClick={() => handleLog(true)}
            disabled={isPending}
            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
              status === 'completed'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
            }`}
            aria-label="Mark completed"
            title="Mark completed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>

          {/* Not completed button */}
          <button
            onClick={() => handleLog(false)}
            disabled={isPending}
            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
              status === 'not-completed'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700'
            }`}
            aria-label="Mark not completed"
            title="Mark not completed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Delete button */}
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Delete habit"
            title="Delete habit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirmed}
        title="Delete Habit"
        message={`Are you sure you want to delete "${habit.name}"? All of your data for this habit will be removed from our system if deleted.`}
        confirmText="Yes"
        cancelText="No"
        isDangerous={true}
      />
    </div>
  );
}
