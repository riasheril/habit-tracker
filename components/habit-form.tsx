'use client';

import { useState, useTransition } from 'react';
import { createHabit } from '@/lib/actions/habits';

export default function HabitForm() {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createHabit(name);

      if (!result.success) {
        setError(result.error);
      } else {
        setName('');
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Add a New Habit</h2>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter habit name (e.g., Exercise, Read, Meditate)"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
          disabled={isPending}
        />
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Adding...' : 'Add Habit'}
        </button>
      </form>
      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
