import { HabitCompletion, CompletionStatus } from '@/types';
import { getMonthDays } from './date-utils';

/**
 * Get the completion status for a specific habit on a specific date
 */
export function getCompletionStatus(
  habitId: number,
  date: string,
  completions: HabitCompletion[]
): CompletionStatus {
  const completion = completions.find(c => {
    // Handle both string and Date types from database
    const completionDate = typeof c.completion_date === 'string'
      ? c.completion_date
      : new Date(c.completion_date).toISOString().split('T')[0];

    return c.habit_id === habitId && completionDate === date;
  });

  if (!completion) return 'unlogged';
  return completion.completed ? 'completed' : 'not-completed';
}

/**
 * Calculate the percentage of days completed in a given month
 */
export function getMonthlyPercentage(
  completions: HabitCompletion[],
  year: number,
  month: number
): number {
  const daysInMonth = getMonthDays(year, month);
  const totalDays = daysInMonth.length;

  if (totalDays === 0) return 0;

  // Filter completions for this specific month/year
  const completedDaysInMonth = completions.filter(c => {
    if (c.completed !== true) return false;

    const completionDate = typeof c.completion_date === 'string'
      ? c.completion_date
      : new Date(c.completion_date).toISOString().split('T')[0];

    const date = new Date(completionDate);
    return date.getFullYear() === year && date.getMonth() === month;
  }).length;

  return Math.round((completedDaysInMonth / totalDays) * 100);
}
