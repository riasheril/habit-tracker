'use client';

import { useMemo } from 'react';
import { formatDateForDb, isToday } from '@/lib/date-utils';
import { addDays, startOfWeek, format } from 'date-fns';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export default function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  // Always show the current week (users can only edit current week)
  const weekDays = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const dayStr = formatDateForDb(day);
          const isSelected = dayStr === selectedDate;
          const isTodayDate = isToday(day);
          const isFutureDate = day > new Date();
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          day.setHours(0, 0, 0, 0);

          return (
            <button
              key={dayStr}
              onClick={() => !isFutureDate && onDateChange(dayStr)}
              disabled={isFutureDate}
              className={`flex flex-col items-center py-2 px-1 rounded-lg transition-colors ${
                isSelected
                  ? 'bg-emerald-600 text-white'
                  : isTodayDate
                  ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-600'
                  : isFutureDate
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-xs font-medium mb-0.5">
                {format(day, 'EEE')}
              </span>
              <span className={`text-base font-semibold ${isSelected ? 'text-white' : ''}`}>
                {format(day, 'd')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
