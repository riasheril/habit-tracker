import React, { useState } from 'react';

function HabitForm({ onAddHabit }) {
  const [habitName, setHabitName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (habitName.trim()) {
      onAddHabit(habitName.trim());
      setHabitName('');
    }
  };

  return (
    <div className="habit-form">
      <h2>Add a New Habit</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter habit name (e.g., Exercise, Read, Meditate)"
          value={habitName}
          onChange={(e) => setHabitName(e.target.value)}
        />
        <button type="submit">Add Habit</button>
      </form>
    </div>
  );
}

export default HabitForm;
