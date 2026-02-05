import React from 'react';
import { Card } from '@/components/ui/card';
import { eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth, format, getDay } from 'date-fns';
import { cn } from '@/lib/utils';

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarGrid({ currentDate, monthTasks, onDateSelect }) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Get all days including padding from previous/next month
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - getDay(monthStart));
  
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - getDay(monthEnd)));
  
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getTaskCountForDay = (day) => {
    return monthTasks.filter(task => {
      const taskDate = new Date(task.deadline);
      return taskDate.getDate() === day.getDate() &&
             taskDate.getMonth() === day.getMonth() &&
             taskDate.getFullYear() === day.getFullYear();
    }).length;
  };

  return (
    <Card className="p-4 bg-white border border-gray-200">
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">{format(currentDate, 'MMMM yyyy')}</h3>
        
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1">
          {dayLabels.map(label => (
            <div key={label} className="text-xs font-semibold text-gray-600 text-center py-2">
              {label}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {allDays.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = new Date().toDateString() === day.toDateString();
            const taskCount = getTaskCountForDay(day);

            return (
              <button
                key={idx}
                onClick={() => onDateSelect(day)}
                className={cn(
                  'aspect-square rounded-lg text-sm font-medium transition-all hover:bg-gray-100',
                  isCurrentMonth ? 'text-gray-900 bg-white' : 'text-gray-400 bg-gray-50',
                  isToday && 'ring-2 ring-indigo-500 bg-indigo-50'
                )}
              >
                <div className="h-full flex flex-col items-center justify-center p-1">
                  <span>{format(day, 'd')}</span>
                  {taskCount > 0 && (
                    <span className="text-xs bg-indigo-600 text-white rounded-full w-4 h-4 flex items-center justify-center mt-0.5">
                      {taskCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}