import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from 'utils';
import { Building2, CheckSquare, MessageSquare, Sparkles, Calendar } from 'lucide-react';
import FundraisingProgress from '../components/dashboard/FundraisingProgress';
import TasksOverview from '../components/dashboard/TasksOverview';
import { format } from 'date-fns';

export default function Dashboard() {
  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => base44.entities.Company.list('-updated_date'),
  });

  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-updated_date'),
  });

  const { data: messages } = useQuery({
    queryKey: ['messages'],
    queryFn: () => base44.entities.Message.list('-created_date', 5),
  });

  const upcomingTasks = tasks?.filter(t => {
    if (!t.deadline || t.status === 'done') return false;
    const deadline = new Date(t.deadline);
    const today = new Date();
    const inTwoWeeks = new Date();
    inTwoWeeks.setDate(today.getDate() + 14);
    return deadline >= today && deadline <= inTwoWeeks;
  }).slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">BSides TLV 2026</h1>
              <p className="text-gray-600 mt-1">Fundraising & Event Planning Dashboard</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to={createPageUrl('Sponsors')}>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Building2 className="w-4 h-4 mr-2" />
                  Sponsors
                </Button>
              </Link>
              <Link to={createPageUrl('Tasks')}>
                <Button variant="outline">
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Tasks
                </Button>
              </Link>
              <Link to={createPageUrl('Messages')}>
                <Button variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Messages
                </Button>
              </Link>
              <Link to={createPageUrl('AIResearch')}>
                <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Research
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FundraisingProgress companies={companies || []} />
          <TasksOverview tasks={tasks || []} />
        </div>

        {/* Upcoming Tasks & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Tasks */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              Upcoming Deadlines
            </h2>
            {upcomingTasks.length > 0 ? (
              <div className="space-y-3">
                {upcomingTasks.map(task => (
                  <div key={task.id} className="border-l-4 border-orange-400 pl-3 py-2">
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-gray-600">
                      Due: {format(new Date(task.deadline), 'MMM d, yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No upcoming deadlines in the next 2 weeks</p>
            )}
          </div>

          {/* Recent Messages */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Recent Messages
            </h2>
            {messages && messages.length > 0 ? (
              <div className="space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className="border-l-4 border-blue-400 pl-3 py-2">
                    <p className="text-sm line-clamp-2">{msg.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {msg.created_by} • {format(new Date(msg.created_date), 'MMM d, h:mm a')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No messages yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}