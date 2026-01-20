import { HabitCompletion } from '@/types';

/**
 * Calculate the current active streak for a habit
 * Returns 0 if the most recent logged day was marked as "not-completed"
 * Otherwise counts consecutive completed days from the most recent completion
 */
export function calculateStreak(completions: HabitCompletion[]): number {
  if (completions.length === 0) return 0;

  // Sort ALL completions by date descending (most recent first)
  const allCompletions = [...completions].sort((a, b) => {
    const dateA = typeof a.completion_date === 'string' ? a.completion_date : new Date(a.completion_date).toISOString().split('T')[0];
    const dateB = typeof b.completion_date === 'string' ? b.completion_date : new Date(b.completion_date).toISOString().split('T')[0];
    return dateB.localeCompare(dateA);
  });

  // If the most recent logged day was "not-completed", streak is broken (return 0)
  if (allCompletions[0].completed === false) {
    return 0;
  }

  // Now filter only completed=true records and count the streak
  const completed = completions
    .filter(c => c.completed === true)
    .sort((a, b) => {
      const dateA = typeof a.completion_date === 'string' ? a.completion_date : new Date(a.completion_date).toISOString().split('T')[0];
      const dateB = typeof b.completion_date === 'string' ? b.completion_date : new Date(b.completion_date).toISOString().split('T')[0];
      return dateB.localeCompare(dateA);
    });

  if (completed.length === 0) return 0;

  // Start from most recent completion and count backwards
  let streak = 1;
  let currentDate = new Date(completed[0].completion_date);

  for (let i = 1; i < completed.length; i++) {
    const prevDate = new Date(completed[i].completion_date);
    const dayDiff = Math.floor(
      (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (dayDiff === 1) {
      // Consecutive day found
      streak++;
      currentDate = prevDate;
    } else {
      // Gap found, stop counting
      break;
    }
  }

  return streak;
}

/**
 * Calculate the longest streak ever achieved for a habit
 * Examines all completion records and finds the longest consecutive sequence
 */
export function calculateLongestStreak(completions: HabitCompletion[]): number {
  if (completions.length === 0) return 0;

  // Filter only completed=true records and sort by date ascending
  const completed = completions
    .filter(c => c.completed === true)
    .sort((a, b) => {
      const dateA = typeof a.completion_date === 'string' ? a.completion_date : new Date(a.completion_date).toISOString().split('T')[0];
      const dateB = typeof b.completion_date === 'string' ? b.completion_date : new Date(b.completion_date).toISOString().split('T')[0];
      return dateA.localeCompare(dateB); // ascending order
    });

  if (completed.length === 0) return 0;

  let longestStreak = 1;
  let currentStreak = 1;
  let previousDate = new Date(completed[0].completion_date);

  for (let i = 1; i < completed.length; i++) {
    const currentDate = new Date(completed[i].completion_date);
    const dayDiff = Math.floor(
      (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (dayDiff === 1) {
      // Consecutive day found
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      // Gap found, reset current streak
      currentStreak = 1;
    }

    previousDate = currentDate;
  }

  return longestStreak;
}
