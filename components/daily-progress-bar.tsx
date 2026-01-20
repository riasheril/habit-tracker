'use client';

import { HabitWithCompletions } from '@/types';
import { getCompletionStatus } from '@/lib/completion-utils';

interface DailyProgressBarProps {
  habits: HabitWithCompletions[];
  selectedDate: string;
}

export default function DailyProgressBar({ habits, selectedDate }: DailyProgressBarProps) {
  const totalHabits = habits.length;

  if (totalHabits === 0) return null;

  const completedCount = habits.filter(habit =>
    getCompletionStatus(habit.id, selectedDate, habit.completions) === 'completed'
  ).length;

  const percentage = Math.round((completedCount / totalHabits) * 100);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">Daily Progress</h3>
        <span className="text-sm font-semibold text-gray-900">
          {completedCount} / {totalHabits} completed
        </span>
      </div>

      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="mt-2 text-xs text-gray-500 text-center">
        {percentage === 100 ? '🎉 All habits completed!' : `${percentage}% complete`}
      </div>
    </div>
  );
}
