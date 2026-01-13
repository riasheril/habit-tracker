import React from 'react';
import './ListView.css';

function ListView({ habits, completions, onToggleCompletion, onDeleteHabit }) {
  const today = new Date().toISOString().split('T')[0];

  const isCompletedToday = (habitId) => {
    const habitCompletions = completions[habitId] || [];
    const completion = habitCompletions.find(c => c.completion_date === today);
    return completion && completion.completed;
  };

  const calculateStreak = (habitId) => {
    const habitCompletions = completions[habitId] || [];
    const completedDates = habitCompletions
      .filter(c => c.completed)
      .map(c => new Date(c.completion_date))
      .sort((a, b) => b - a);

    if (completedDates.length === 0) return 0;

    let streak = 0;
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const yesterday = new Date(todayDate);
    yesterday.setDate(yesterday.getDate() - 1);

    const mostRecent = new Date(completedDates[0]);
    mostRecent.setHours(0, 0, 0, 0);

    if (mostRecent.getTime() !== todayDate.getTime() && mostRecent.getTime() !== yesterday.getTime()) {
      return 0;
    }

    let currentDate = new Date(mostRecent);

    for (const completedDate of completedDates) {
      const checkDate = new Date(completedDate);
      checkDate.setHours(0, 0, 0, 0);

      if (checkDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (checkDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    return streak;
  };

  const getCompletionRate = (habitId) => {
    const habitCompletions = completions[habitId] || [];
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysInMonth = Math.floor((today - startOfMonth) / (1000 * 60 * 60 * 24)) + 1;

    const completedDays = habitCompletions.filter(c => {
      const completionDate = new Date(c.completion_date);
      return c.completed && completionDate >= startOfMonth && completionDate <= today;
    }).length;

    return daysInMonth > 0 ? Math.round((completedDays / daysInMonth) * 100) : 0;
  };

  const handleToggle = (habitId) => {
    onToggleCompletion(habitId, today);
  };

  return (
    <div className="list-view">
      <h2>Today's Habits</h2>
      <div className="habits-list">
        {habits.map(habit => {
          const completed = isCompletedToday(habit.id);
          const streak = calculateStreak(habit.id);
          const completionRate = getCompletionRate(habit.id);

          return (
            <div key={habit.id} className="habit-item">
              <div className="habit-checkbox">
                <input
                  type="checkbox"
                  checked={completed}
                  onChange={() => handleToggle(habit.id)}
                  id={`habit-${habit.id}`}
                />
                <label htmlFor={`habit-${habit.id}`} className={completed ? 'completed' : ''}>
                  {habit.name}
                </label>
              </div>
              <div className="habit-stats">
                <span className="stat">
                  <strong>{streak}</strong> day streak
                </span>
                <span className="stat">
                  <strong>{completionRate}%</strong> this month
                </span>
                <button
                  className="delete-btn-small"
                  onClick={() => onDeleteHabit(habit.id)}
                  title="Delete habit"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ListView;
