import React from 'react';
import './CalendarView.css';

function CalendarView({ habits, completions, onToggleCompletion, onDeleteHabit }) {
  const getDaysInMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    return days;
  };

  const isCompleted = (habitId, date) => {
    const dateStr = date.toISOString().split('T')[0];
    const habitCompletions = completions[habitId] || [];
    const completion = habitCompletions.find(c => c.completion_date === dateStr);
    return completion && completion.completed;
  };

  const handleDayClick = (habitId, date) => {
    const dateStr = date.toISOString().split('T')[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date > today) {
      return;
    }

    onToggleCompletion(habitId, dateStr);
  };

  const calculateStreak = (habitId) => {
    const habitCompletions = completions[habitId] || [];
    const completedDates = habitCompletions
      .filter(c => c.completed)
      .map(c => new Date(c.completion_date))
      .sort((a, b) => b - a);

    if (completedDates.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const mostRecent = new Date(completedDates[0]);
    mostRecent.setHours(0, 0, 0, 0);

    if (mostRecent.getTime() !== today.getTime() && mostRecent.getTime() !== yesterday.getTime()) {
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

  const days = getDaysInMonth();
  const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="calendar-view">
      <h2>{monthName}</h2>
      {habits.map(habit => (
        <div key={habit.id} className="habit-calendar">
          <div className="habit-header">
            <div>
              <h3>{habit.name}</h3>
              <span className="streak">
                {calculateStreak(habit.id)} day streak
              </span>
            </div>
            <button
              className="delete-btn"
              onClick={() => onDeleteHabit(habit.id)}
            >
              Delete
            </button>
          </div>
          <div className="calendar-grid">
            {days.map(day => {
              const completed = isCompleted(habit.id, day);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isFuture = day > today;

              return (
                <div
                  key={day.toISOString()}
                  className={`day ${completed ? 'completed' : ''} ${isFuture ? 'future' : ''}`}
                  onClick={() => handleDayClick(habit.id, day)}
                  title={`${day.toLocaleDateString()} - ${completed ? 'Completed' : 'Not completed'}`}
                >
                  <span className="day-number">{day.getDate()}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default CalendarView;
