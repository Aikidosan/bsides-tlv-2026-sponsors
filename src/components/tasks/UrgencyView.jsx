import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TaskCard from './TaskCard';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { isPast, isFuture, differenceInDays } from 'date-fns';

export default function UrgencyView({ tasks, onTaskClick, onStatusChange }) {
  const today = new Date();
  
  const overdue = tasks.filter(t => t.deadline && isPast(new Date(t.deadline)) && t.status !== 'done');
  const urgent = tasks.filter(t => {
    if (!t.deadline || t.status === 'done') return false;
    const deadline = new Date(t.deadline);
    const daysUntil = differenceInDays(deadline, today);
    return daysUntil >= 0 && daysUntil <= 3;
  });
  const soon = tasks.filter(t => {
    if (!t.deadline || t.status === 'done') return false;
    const deadline = new Date(t.deadline);
    const daysUntil = differenceInDays(deadline, today);
    return daysUntil > 3 && daysUntil <= 14;
  });
  const later = tasks.filter(t => {
    if (!t.deadline || t.status === 'done') return false;
    const deadline = new Date(t.deadline);
    return differenceInDays(deadline, today) > 14;
  });
  const noDueDate = tasks.filter(t => !t.deadline && t.status !== 'done');

  const sections = [
    { id: 'overdue', title: 'Overdue', tasks: overdue, color: 'bg-red-100', icon: AlertCircle, iconColor: 'text-red-600' },
    { id: 'urgent', title: 'Due in 3 Days', tasks: urgent, color: 'bg-orange-100', icon: AlertCircle, iconColor: 'text-orange-600' },
    { id: 'soon', title: 'Due in 2 Weeks', tasks: soon, color: 'bg-yellow-100', icon: Clock, iconColor: 'text-yellow-600' },
    { id: 'later', title: 'Later', tasks: later, color: 'bg-blue-100', icon: Clock, iconColor: 'text-blue-600' },
    { id: 'no_date', title: 'No Due Date', tasks: noDueDate, color: 'bg-gray-100', icon: CheckCircle, iconColor: 'text-gray-600' }
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