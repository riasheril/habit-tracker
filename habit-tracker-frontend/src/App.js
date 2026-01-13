import React, { useState, useEffect } from 'react';
import './App.css';
import HabitForm from './components/HabitForm';
import CalendarView from './components/CalendarView';
import ListView from './components/ListView';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('calendar');

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/habits`);
      if (!response.ok) throw new Error('Failed to fetch habits');
      const data = await response.json();
      setHabits(data);

      await fetchAllCompletions(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCompletions = async (habitsList) => {
    const completionsData = {};

    const startDate = new Date();
    startDate.setDate(1);
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1, 0);

    for (const habit of habitsList) {
      try {
        const response = await fetch(
          `${API_URL}/api/habits/${habit.id}/completions?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`
        );
        if (response.ok) {
          const data = await response.json();
          completionsData[habit.id] = data;
        }
      } catch (err) {
        console.error(`Error fetching completions for habit ${habit.id}:`, err);
      }
    }

    setCompletions(completionsData);
  };

  const addHabit = async (name) => {
    try {
      const response = await fetch(`${API_URL}/api/habits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) throw new Error('Failed to add habit');

      const newHabit = await response.json();
      setHabits([newHabit, ...habits]);
      setCompletions({ ...completions, [newHabit.id]: [] });
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteHabit = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/habits/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete habit');

      setHabits(habits.filter(habit => habit.id !== id));
      const newCompletions = { ...completions };
      delete newCompletions[id];
      setCompletions(newCompletions);
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleCompletion = async (habitId, date, completed = null) => {
    try {
      const body = completed !== null
        ? { date, completed }
        : { date };

      const response = await fetch(`${API_URL}/api/habits/${habitId}/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to toggle completion');

      const updatedCompletion = await response.json();

      const habitCompletions = completions[habitId] || [];
      const existingIndex = habitCompletions.findIndex(
        c => c.completion_date === date
      );

      let updatedHabitCompletions;
      if (existingIndex >= 0) {
        updatedHabitCompletions = [...habitCompletions];
        updatedHabitCompletions[existingIndex] = updatedCompletion;
      } else {
        updatedHabitCompletions = [updatedCompletion, ...habitCompletions];
      }

      setCompletions({
        ...completions,
        [habitId]: updatedHabitCompletions,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="App">
      <div className="header">
        <h1>Tiny Habit Streak Tracker</h1>
        <p>Build better habits, one day at a time</p>
      </div>

      {error && <div className="error">Error: {error}</div>}

      <HabitForm onAddHabit={addHabit} />

      {habits.length === 0 ? (
        <div className="no-habits">
          No habits yet. Add your first habit above!
        </div>
      ) : (
        <>
          <div className="view-toggle">
            <button
              className={viewMode === 'calendar' ? 'active' : ''}
              onClick={() => setViewMode('calendar')}
            >
              Calendar View
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              List View
            </button>
          </div>

          {viewMode === 'calendar' ? (
            <CalendarView
              habits={habits}
              completions={completions}
              onToggleCompletion={toggleCompletion}
              onDeleteHabit={deleteHabit}
            />
          ) : (
            <ListView
              habits={habits}
              completions={completions}
              onToggleCompletion={toggleCompletion}
              onDeleteHabit={deleteHabit}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
