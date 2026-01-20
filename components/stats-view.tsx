'use client';

import { useState, useMemo } from 'react';
import { HabitWithCompletions } from '@/types';
import HabitCalendar from '@/components/habit-calendar';

interface StatsViewProps {
  initialHabits: HabitWithCompletions[];
  initialMonth: number;
  initialYear: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function StatsView({ initialHabits, initialMonth, initialYear }: StatsViewProps) {
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);

  // Calculate the earliest month where ANY habit has data
  const earliestDataMonth = useMemo(() => {
    if (initialHabits.length === 0) return null;

    let earliestDate: Date | null = null;

    initialHabits.forEach(habit => {
      // Check habit creation date
      const createdDate = new Date(habit.created_at);
      if (!earliestDate || createdDate < earliestDate) {
        earliestDate = createdDate;
      }

      // Also check first completion date (if any)
      if (habit.completions.length > 0) {
        const firstCompletion = habit.completions.reduce((earliest, c) => {
          const cDate = new Date(c.completion_date);
          return !earliest || cDate < new Date(earliest.completion_date) ? c : earliest;
        });
        const firstDate = new Date(firstCompletion.completion_date);
        if (!earliestDate || firstDate < earliestDate) {
          earliestDate = firstDate;
        }
      }
    });

    if (!earliestDate) return null;

    // TypeScript assertion: we know earliestDate is not null after the check above
    const date = earliestDate as Date;
    return {
      month: date.getMonth(),
      year: date.getFullYear()
    };
  }, [initialHabits]);

  // Determine if we can go to previous/next month
  const canGoPrevious = useMemo(() => {
    if (!earliestDataMonth) return false;
    const current = year * 12 + month;
    const earliest = earliestDataMonth.year * 12 + earliestDataMonth.month;
    return current > earliest;
  }, [month, year, earliestDataMonth]);

  const canGoNext = useMemo(() => {
    const current = year * 12 + month;
    const today = initialYear * 12 + initialMonth;
    return current < today;
  }, [month, year, initialMonth, initialYear]);

  const goToPreviousMonth = () => {
    if (!canGoPrevious) return;
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const goToNextMonth = () => {
    if (!canGoNext) return;
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const goToCurrentMonth = () => {
    setMonth(initialMonth);
    setYear(initialYear);
  };

  const isCurrentMonth = month === initialMonth && year === initialYear;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Stats</h1>
        <p className="text-gray-600">View your progress and insights</p>
      </div>

      {/* Month Selector */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousMonth}
            disabled={!canGoPrevious}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {MONTH_NAMES[month]} {year}
            </h2>
            {!isCurrentMonth && (
              <button
                onClick={goToCurrentMonth}
                className="text-sm text-emerald-700 hover:underline mt-1"
              >
                Back to current month
              </button>
            )}
          </div>
          <button
            onClick={goToNextMonth}
            disabled={!canGoNext}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Habit Calendars */}
      {initialHabits.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No habits yet. Create habits from the Home view!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {initialHabits.map((habit) => (
            <HabitCalendar key={habit.id} habit={habit} year={year} month={month} />
          ))}
        </div>
      )}
    </div>
  );
}
