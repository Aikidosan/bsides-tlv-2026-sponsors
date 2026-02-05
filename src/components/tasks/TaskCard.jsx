import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Flag, ArrowRight } from "lucide-react";
import { format, isPast } from "date-fns";

const priorityColors = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700"
};

const categoryColors = {
  fundraising: "bg-green-100 text-green-800",
  marketing: "bg-purple-100 text-purple-800",
  logistics: "bg-yellow-100 text-yellow-800",
  speakers: "bg-indigo-100 text-indigo-800",
  venue: "bg-pink-100 text-pink-800",
  general: "bg-gray-100 text-gray-800"
};

export default function TaskCard({ task, onClick, onStatusChange }) {
  const isOverdue = task.deadline && isPast(new Date(task.deadline)) && task.status !== 'done';

  return (
    <Card 
      className={`p-3 hover:shadow-md transition-all cursor-pointer border-l-4 ${
        isOverdue ? 'border-l-red-500 bg-red-50' : 'border-l-gray-300'
      }`}
      onClick={onClick}
    >
      <div className="space-y-2">
        <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
        
        {task.description && (
          <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
        )}

        <div className="flex flex-wrap gap-1">
          {task.priority && (
            <Badge className={priorityColors[task.priority] + " text-xs"}>
              <Flag className="w-3 h-3 mr-1" />
              {task.priority}
            </Badge>
          )}
          {task.category && (
            <Badge className={categoryColors[task.category] + " text-xs"}>
              {task.category}
            </Badge>
          )}
        </div>

        {task.deadline && (
          <div className={`flex items-center gap-1 text-xs ${
            isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'
          }`}>
            <Calendar className="w-3 h-3" />
            <span>{format(new Date(task.deadline), 'MMM d, yyyy')}</span>
            {isOverdue && <span className="ml-1">(Overdue)</span>}
          </div>
        )}

        {task.assigned_to && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <User className="w-3 h-3" />
            <span>{task.assigned_to.split('@')[0]}</span>
          </div>
        )}

        {task.status !== 'done' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              const nextStatus = task.status === 'todo' ? 'in_progress' : 'done';
              onStatusChange(nextStatus);
            }}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2"
          >
            <ArrowRight className="w-3 h-3" />
            <span>Move to {task.status === 'todo' ? 'In Progress' : 'Done'}</span>
          </button>
        )}
      </div>
    </Card>
  );
}