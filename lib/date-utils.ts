import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

/**
 * Format a Date object to YYYY-MM-DD string for database storage
 * Timezone-safe formatting
 */
export function formatDateForDb(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get all days in a given month
 */
export function getMonthDays(year: number, month: number): Date[] {
  const start = startOfMonth(new Date(year, month, 1));
  const end = endOfMonth(new Date(year, month, 1));
  return eachDayOfInterval({ start, end });
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return formatDateForDb(date) === formatDateForDb(today);
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate > today;
}

/**
 * Get the start of the week for a given date (Sunday = 0)
 */
export function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day;
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of the week for a given date (Saturday)
 */
export function endOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() + (6 - day);
  result.setDate(diff);
  result.setHours(23, 59, 59, 999);
  return result;
}
