import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TaskCard from './TaskCard';

const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'done', title: 'Done', color: 'bg-green-100' }
];

export default function TaskBoard({ tasks, onTaskClick, onStatusChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map(column => {
        const columnTasks = tasks?.filter(t => t.status === column.id) || [];
        
        return (
          <Card key={column.id} className="flex flex-col">
            <CardHeader className={`${column.color} border-b`}>
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>{column.title}</span>
                <span className="text-xs bg-white px-2 py-1 rounded-full">
                  {columnTasks.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-3 space-y-2 min-h-[400px]">
              {columnTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick(task)}
                  onStatusChange={(newStatus) => onStatusChange(task, newStatus)}
                />
              ))}
              {columnTasks.length === 0 && (
                <div className="text-center text-gray-400 text-sm mt-8">
                  No tasks
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}