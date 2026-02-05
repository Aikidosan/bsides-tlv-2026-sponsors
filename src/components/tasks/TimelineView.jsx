import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TaskCard from './TaskCard';
import { Calendar, CalendarX } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export default function TimelineView({ tasks, onTaskClick, onStatusChange }) {
  const today = new Date();
  const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const thisMonthStart = startOfMonth(today);
  const thisMonthEnd = endOfMonth(today);
  const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const nextMonthEnd = endOfMonth(nextMonthStart);

  const thisWeek = tasks.filter(t => {
    if (!t.deadline) return false;
    const deadline = new Date(t.deadline);
    return isWithinInterval(deadline, { start: thisWeekStart, end: thisWeekEnd });
  });

  const thisMonth = tasks.filter(t => {
    if (!t.deadline) return false;
    const deadline = new Date(t.deadline);
    return isWithinInterval(deadline, { start: thisMonthStart, end: thisMonthEnd }) && 
           !isWithinInterval(deadline, { start: thisWeekStart, end: thisWeekEnd });
  });

  const nextMonth = tasks.filter(t => {
    if (!t.deadline) return false;
    const deadline = new Date(t.deadline);
    return isWithinInterval(deadline, { start: nextMonthStart, end: nextMonthEnd });
  });

  const future = tasks.filter(t => {
    if (!t.deadline) return false;
    const deadline = new Date(t.deadline);
    return deadline > nextMonthEnd;
  });

  const noDueDate = tasks.filter(t => !t.deadline);

  const sections = [
    { id: 'week', title: 'This Week', tasks: thisWeek, color: 'bg-red-100', icon: Calendar, iconColor: 'text-red-600' },
    { id: 'month', title: 'This Month', tasks: thisMonth, color: 'bg-orange-100', icon: Calendar, iconColor: 'text-orange-600' },
    { id: 'next', title: 'Next Month', tasks: nextMonth, color: 'bg-blue-100', icon: Calendar, iconColor: 'text-blue-600' },
    { id: 'future', title: 'Future', tasks: future, color: 'bg-green-100', icon: Calendar, iconColor: 'text-green-600' },
    { id: 'no_date', title: 'No Due Date', tasks: noDueDate, color: 'bg-gray-100', icon: CalendarX, iconColor: 'text-gray-600' }
  ];

  return (
    <div className="space-y-4">
      {sections.map(section => {
        const Icon = section.icon;
        return (
          <Card key={section.id}>
            <CardHeader className={`${section.color} border-b`}>
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${section.iconColor}`} />
                  {section.title}
                </span>
                <span className="text-xs bg-white px-2 py-1 rounded-full">
                  {section.tasks.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              {section.tasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {section.tasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => onTaskClick(task)}
                      onStatusChange={(newStatus) => onStatusChange(task, newStatus)}
                      onAIAssist={(task) => onTaskClick(task, true)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 text-sm py-4">No tasks</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}