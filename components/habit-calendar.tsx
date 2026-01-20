'use client';

import { useMemo } from 'react';
import { HabitWithCompletions } from '@/types';
import { calculateStreak, calculateLongestStreak } from '@/lib/streak-calculator';
import { getCompletionStatus } from '@/lib/completion-utils';
import { getMonthlyPercentage } from '@/lib/completion-utils';
import { getMonthDays, formatDateForDb, isFuture } from '@/lib/date-utils';

interface HabitCalendarProps {
  habit: HabitWithCompletions;
  year: number;
  month: number; // 0-indexed (JavaScript Date format)
}

export default function HabitCalendar({ habit, year, month }: HabitCalendarProps) {
  const days = getMonthDays(year, month);
  const currentStreak = calculateStreak(habit.completions);
  const longestStreak = calculateLongestStreak(habit.completions);
  const percentage = getMonthlyPercentage(habit.completions, year, month);

  // Create calendar grid with weeks as rows
  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];

  days.forEach((day, index) => {
    if (index === 0) {
      // First day - add empty cells before it
      const firstDayOfWeek = day.getDay(); // 0 = Sunday, 6 = Saturday
      for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push(null);
      }
    }

    currentWeek.push(day);

    // If we've filled a week (7 days), start a new week
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  // Add remaining days in the last week
  if (currentWeek.length > 0) {
    // Fill remaining cells with nulls
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  const weekdayLabels = ['sun', 'mon', 'tues', 'wed', 'thurs', 'fri', 'sat'];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Habit name */}
      <h3 className="text-sm font-semibold text-gray-900 mb-3 text-center">{habit.name}</h3>

      {/* Day labels on top */}
      <div className="flex gap-4 mb-1">
        <div className="flex-shrink-0" style={{ width: '120px' }} />
        <div className="flex-1 grid grid-cols-7 gap-1">
          {weekdayLabels.map((label, i) => (
            <div key={i} className="text-center">
              <span className="text-[10px] font-medium text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column layout: metrics on left, calendar on right */}
      <div className="flex gap-4">
        {/* Left: Metrics - vertical stack */}
        <div className="space-y-1 flex-shrink-0" style={{ width: '120px' }}>
          <div className="bg-gray-50 rounded px-2 py-1 text-center">
            <div className="text-[10px] text-gray-500">Current Streak</div>
            <div className="text-xs font-semibold text-gray-900">🔥 {currentStreak} days</div>
          </div>
          <div className="bg-gray-50 rounded px-2 py-1 text-center">
            <div className="text-[10px] text-gray-500">Longest Streak</div>
            <div className="text-xs font-semibold text-gray-900">{longestStreak} days</div>
          </div>
          <div className="bg-gray-50 rounded px-2 py-1 text-center">
            <div className="text-[10px] text-gray-500">This Month</div>
            <div className="text-xs font-semibold text-gray-900">{percentage}%</div>
          </div>
        </div>

        {/* Right: Calendar weeks */}
        <div className="flex-1 space-y-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((date, dayIndex) => {
                if (!date) {
                  // Empty cell
                  return <div key={`empty-${weekIndex}-${dayIndex}`} className="aspect-square" />;
                }

                const dateStr = formatDateForDb(date);
                const status = getCompletionStatus(habit.id, dateStr, habit.completions);
                const isDateFuture = isFuture(date);

                let bgColor = 'bg-gray-100';
                let textColor = 'text-gray-400';
                if (status === 'completed') {
                  bgColor = 'bg-emerald-500';
                  textColor = 'text-white';
                }
                if (status === 'not-completed') {
                  bgColor = 'bg-red-400';
                  textColor = 'text-white';
                }

                return (
                  <div
                    key={dateStr}
                    className={`aspect-square rounded-sm ${bgColor} ${
                      isDateFuture ? 'opacity-30' : ''
                    } flex items-center justify-center`}
                  >
                    <span className={`text-[10px] font-medium ${textColor}`}>
                      {date.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
