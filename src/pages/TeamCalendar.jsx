import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, format } from 'date-fns';
import TeamLane from '../components/calendar/TeamLane';
import CalendarGrid from '../components/calendar/CalendarGrid';

export default function TeamCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-deadline'),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get tasks for current month
  const monthTasks = tasks.filter(task => {
    if (!task.deadline) return false;
    const taskDate = new Date(task.deadline);
    return isSameMonth(taskDate, currentDate);
  });

  // Group tasks by assigned team member
  const tasksByTeamMember = {};
  users.forEach(user => {
    tasksByTeamMember[user.email] = monthTasks.filter(t => t.assigned_to === user.email);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Dashboard')}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Team Calendar</h1>
                <p className="text-gray-600 mt-1">View all team members' tasks and deadlines</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-lg font-semibold min-w-[150px] text-center">
                {format(currentDate, 'MMMM yyyy')}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar Grid + Team Lanes */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-1">
            <CalendarGrid 
              currentDate={currentDate} 
              monthTasks={monthTasks}
              onDateSelect={(date) => setCurrentDate(date)}
            />
          </div>

          {/* Team Lanes */}
          <div className="lg:col-span-3 space-y-4">
            {users.length > 0 ? (
              users.map(user => (
                <TeamLane
                  key={user.id}
                  user={user}
                  tasks={tasksByTeamMember[user.email] || []}
                  daysInMonth={daysInMonth}
                  currentDate={currentDate}
                />
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No team members found</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}