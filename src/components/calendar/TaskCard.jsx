import React from 'react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

const statusBg = {
  todo: 'bg-gray-50 border-gray-200',
  in_progress: 'bg-blue-50 border-blue-200',
  done: 'bg-green-50 border-green-200'
};

export default function TaskCard({ task, compact = false }) {
  return (
    <div className={`border rounded-lg p-3 ${statusBg[task.status] || 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-gray-900 ${compact ? 'text-xs line-clamp-1' : 'text-sm line-clamp-2'}`}>
            {task.title}
          </p>
          {!compact && task.deadline && (
            <p className="text-xs text-gray-600 mt-1">
              {format(new Date(task.deadline), 'MMM d')}
            </p>
          )}
        </div>
      </div>
      {!compact && task.priority && (
        <div className="mt-2">
          <Badge className={`${priorityColors[task.priority]} text-xs`}>
            {task.priority}
          </Badge>
        </div>
      )}
    </div>
  );
}