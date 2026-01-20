import { formatDateForDb } from './date-utils';
import { startOfWeek, addDays, isAfter, isBefore, startOfDay } from 'date-fns';

/**
 * Get all past days in the current week that should be auto-marked as incomplete
 * Only returns days that are:
 * 1. In the current week (Sun-Sat)
 * 2. Before today
 * 3. Not already logged (no completion record exists)
 */
export function getPastUnloggedDaysInCurrentWeek(habitId: number, completions: any[]): string[] {
  const today = startOfDay(new Date());
  const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Sunday

  const daysToMark: string[] = [];

  // Check each day from week start to yesterday
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);

    // Stop at today (don't auto-mark today or future days)
    if (!isBefore(day, today)) {
      break;
    }

    const dayStr = formatDateForDb(day);

    // Check if this day already has a completion record
    const hasRecord = completions.some(c => {
      const completionDate = typeof c.completion_date === 'string'
        ? c.completion_date
        : new Date(c.completion_date).toISOString().split('T')[0];
      return c.habit_id === habitId && completionDate === dayStr;
    });

    // If no record exists, mark it for auto-completion
    if (!hasRecord) {
      daysToMark.push(dayStr);
    }
  }

  return daysToMark;
}

/**
 * Check if a date is in the current week
 */
export function isInCurrentWeek(date: Date | string): boolean {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 });
  const weekEnd = addDays(weekStart, 6);

  const checkDate = typeof date === 'string' ? new Date(date) : date;

  return !isBefore(checkDate, weekStart) && !isAfter(checkDate, weekEnd);
}
