import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TaskCard from './TaskCard';
import { User, Users } from 'lucide-react';

export default function OwnerView({ tasks, onTaskClick, onStatusChange }) {
  const grouped = {};
  
  tasks.forEach(task => {
    const owner = task.assigned_to || 'Unassigned';
    if (!grouped[owner]) {
      grouped[owner] = [];
    }
    grouped[owner].push(task);
  });

  const sortedOwners = Object.keys(grouped).sort((a, b) => {
    if (a === 'Unassigned') return 1;
    if (b === 'Unassigned') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-4">
      {sortedOwners.map(owner => {
        const ownerTasks = grouped[owner];
        const isUnassigned = owner === 'Unassigned';
        
        return (
          <Card key={owner}>
            <CardHeader className={`${isUnassigned ? 'bg-gray-100' : 'bg-indigo-100'} border-b`}>
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {isUnassigned ? (
                    <Users className="w-4 h-4 text-gray-600" />
                  ) : (
                    <User className="w-4 h-4 text-indigo-600" />
                  )}
                  {isUnassigned ? owner : owner.split('@')[0]}
                </span>
                <span className="text-xs bg-white px-2 py-1 rounded-full">
                  {ownerTasks.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {ownerTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => onTaskClick(task)}
                    onStatusChange={(newStatus) => onStatusChange(task, newStatus)}
                    onAIAssist={(task) => onTaskClick(task, true)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}