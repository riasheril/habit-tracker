import { getHabitsWithCompletions } from '@/lib/queries/habits';
import StatsView from '@/components/stats-view';

export default async function StatsPage() {
  // Fetch all habits with ALL their completion data (no date filtering)
  // We'll let the client filter by month for display
  const habits = await getHabitsWithCompletions(
    '2000-01-01', // Far past date to get all data
    '2099-12-31'  // Far future date to get all data
  );

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  return <StatsView initialHabits={habits} initialMonth={currentMonth} initialYear={currentYear} />;
}
