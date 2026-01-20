import { getHabitsWithCompletions } from '@/lib/queries/habits';
import { formatDateForDb } from '@/lib/date-utils';
import { autoMarkIncompleteForCurrentWeek } from '@/lib/actions/auto-mark';
import HomeView from '@/components/home-view';

export default async function HomePage() {
  // Auto-mark unlogged past days in current week as incomplete
  await autoMarkIncompleteForCurrentWeek();

  // Fetch all habits with completions for the current month
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const habits = await getHabitsWithCompletions(
    formatDateForDb(startOfMonth),
    formatDateForDb(endOfMonth)
  );

  return <HomeView initialHabits={habits} />;
}
