import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { isSameDay, format } from 'date-fns';
import TaskCard from './TaskCard';

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

const statusColors = {
  todo: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  done: 'bg-green-100 text-green-800'
};

export default function TeamLane({ user, tasks, daysInMonth, currentDate }) {
  const getTasksForDay = (day) => {
    return tasks.filter(task => {
      if (!task.deadline) return false;
      const taskDate = new Date(task.deadline);
      return isSameDay(taskDate, day);
    });
  };

  const upcomingTasks = tasks
    .filter(t => t.deadline && new Date(t.deadline) >= new Date())
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3);

  return (
    <Card className="bg-white border border-gray-200 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
            <p className="text-xs text-gray-600">{user.email}</p>
          </div>
          <Badge variant="outline" className="bg-white">
            {tasks.length} tasks
          </Badge>
        </div>
      </div>

      <div className="p-4">
        {upcomingTasks.length > 0 ? (
          <div className="space-y-2">
            {upcomingTasks.map(task => (
              <div key={task.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{task.title}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {task.deadline && format(new Date(task.deadline), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {task.priority && (
                      <Badge className={`${priorityColors[task.priority]} text-xs`}>
                        {task.priority}
                      </Badge>
                    )}
                    {task.status && (
                      <Badge className={`${statusColors[task.status]} text-xs`}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    )}
                    {task.category && (
                      <Badge variant="outline" className="text-xs">
                        {task.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No upcoming tasks</p>
        )}
      </div>
    </Card>
  );
}