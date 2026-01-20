'use client';

import { useState, useMemo } from 'react';
import { HabitWithCompletions } from '@/types';
import { formatDateForDb } from '@/lib/date-utils';
import { getCompletionStatus } from '@/lib/completion-utils';
import HabitForm from '@/components/habit-form';
import DateSelector from '@/components/date-selector';
import HabitCard from '@/components/habit-card';
import DailyProgressBar from '@/components/daily-progress-bar';

interface HomeViewProps {
  initialHabits: HabitWithCompletions[];
}

export default function HomeView({ initialHabits }: HomeViewProps) {
  const [selectedDate, setSelectedDate] = useState(formatDateForDb(new Date()));

  // Sort habits: unlogged first, then completed, then not-completed
  const sortedHabits = useMemo(() => {
    return [...initialHabits].sort((a, b) => {
      const statusA = getCompletionStatus(a.id, selectedDate, a.completions);
      const statusB = getCompletionStatus(b.id, selectedDate, b.completions);

      // Priority: unlogged (0) > completed (1) > not-completed (2)
      const priorityMap = {
        'unlogged': 0,
        'completed': 1,
        'not-completed': 2,
      };

      return priorityMap[statusA] - priorityMap[statusB];
    });
  }, [initialHabits, selectedDate]);

  return (
    <div className="min-h-screen pb-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-gray-50 pb-6 pt-6">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Home</h1>
            <p className="text-gray-600">Track your daily habits</p>
          </div>

          <HabitForm />
          <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
          <DailyProgressBar habits={initialHabits} selectedDate={selectedDate} />
        </div>
      </div>

      {/* Scrollable Habit List */}
      <div className="max-w-4xl mx-auto px-6">
        {initialHabits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No habits yet. Add your first habit above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} selectedDate={selectedDate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
