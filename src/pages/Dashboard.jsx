import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Building2, CheckSquare, MessageSquare, Sparkles, Calendar, CalendarDays, BarChart3, Edit, Users, LogOut, User, GraduationCap, Loader2, Bell } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import FundraisingProgress from '../components/dashboard/FundraisingProgress';
import TasksOverview from '../components/dashboard/TasksOverview';
import CountdownClock from '../components/dashboard/CountdownClock';
import MilestoneTracker from '../components/dashboard/MilestoneTracker';
import ActivityTracker from '../components/dashboard/ActivityTracker';
import { format } from 'date-fns';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [editingTask, setEditingTask] = useState(null);
  const [isFindingAlumni, setIsFindingAlumni] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

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

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: allUsers } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
  });

  const pendingRequests = allUsers?.filter(u => !u.data?.linkedin_verified) || [];

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      setEditingTask(null);
    },
  });

  const handleTakeOwnership = (task) => {
    if (!user) return;
    updateTaskMutation.mutate({
      id: task.id,
      data: { ...task, assigned_to: user.email }
    });
  };

  const handleFindAllAlumni = async () => {
    setIsFindingAlumni(true);
    const companiesList = companies || [];
    let processed = 0;
    let connectionsFound = 0;
    
    try {
      for (const company of companiesList) {
        try {
          const response = await base44.functions.invoke('checkMyNetworkAtCompany', { 
            company_id: company.id 
          });
          
          processed++;
          if (response.data.has_connections) {
            connectionsFound += response.data.connections_found;
          }
          
          // Update progress
          console.log(`Checked ${processed}/${companiesList.length}: ${company.name}`);
          
          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (error) {
          console.error(`Failed to check ${company.name}:`, error);
        }
      }
      
      queryClient.invalidateQueries(['companies']);
      alert(`✅ Checked ${processed} companies and found connections at ${connectionsFound} companies!`);
    } catch (error) {
      alert('Failed to find alumni connections: ' + error.message);
    } finally {
      setIsFindingAlumni(false);
    }
  };

  const upcomingTasks = tasks?.filter(t => {
    if (!t.deadline || t.status === 'done') return false;
    const deadline = new Date(t.deadline);
    const today = new Date();
    const inTwoWeeks = new Date();
    inTwoWeeks.setDate(today.getDate() + 14);
    return deadline >= today && deadline <= inTwoWeeks;
  }).slice(0, 5) || [];

  return (
    <div className="min-h-screen">
      {/* Countdown Clock - Top */}
      <div className="sticky top-0 z-50">
        <CountdownClock />
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl font-bold text-gray-900">BSides TLV 2026</h1>
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full h-auto">
                        <User className="w-3 h-3 mr-1" />
                        {user.full_name || user.email}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => window.location.href = createPageUrl('UserProfile')}>
                        <User className="w-4 h-4 mr-2" />
                        My Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => base44.auth.logout()}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {users && users.length > 0 && (
                  <span className="text-sm text-green-700 bg-green-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Users className="w-3 h-3" />
                    {users.map(u => u.full_name || u.email).join(', ')}
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-1">Fundraising & Event Planning Dashboard</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {user?.role === 'admin' && (
                <Link to={createPageUrl('PendingVerification')}>
                  <Button className="bg-red-600 hover:bg-red-700 relative">
                    <Bell className="w-4 h-4 mr-2" />
                    Pending Verification
                    {pendingRequests.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-white text-red-600 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-red-600">
                        {pendingRequests.length}
                      </span>
                    )}
                  </Button>
                </Link>
              )}
              <Button 
                onClick={handleFindAllAlumni}
                disabled={isFindingAlumni}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {isFindingAlumni ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Finding Alumni...
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Find All Alumni
                  </>
                )}
              </Button>
              <Button 
                onClick={async () => {
                  try {
                    const addResponse = await base44.functions.invoke('addMissingPastSponsors', {});
                    const tagResponse = await base44.functions.invoke('tagPastSponsors', {});
                    alert(`Added ${addResponse.data.added_count} new companies and tagged ${tagResponse.data.updated_count} with past sponsor years!`);
                    queryClient.invalidateQueries(['companies']);
                  } catch (error) {
                    alert('Failed to process sponsors: ' + error.message);
                  }
                }}
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Add & Tag Past Sponsors
              </Button>
              <Link to={createPageUrl('Sponsors')}>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Building2 className="w-4 h-4 mr-2" />
                  Sponsors
                </Button>
              </Link>
              <Link to={createPageUrl('Analytics')}>
                <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
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
              <Link to={createPageUrl('CEOOutreach')}>
                <Button variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-50">
                  <Building2 className="w-4 h-4 mr-2" />
                  CEO Outreach
                </Button>
              </Link>
              <Link to={createPageUrl('AIResearch')}>
                <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Research
                </Button>
              </Link>
              <Link to={createPageUrl('OutreachTracker')}>
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                  <Calendar className="w-4 h-4 mr-2" />
                  Outreach Tracker
                </Button>
              </Link>
              <Link to={createPageUrl('TeamCalendar')}>
                <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Team Calendar
                </Button>
              </Link>
              <Link to={createPageUrl('AdminUsers')}>
                <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                  <Building2 className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
              <Link to={createPageUrl('ActivityLog')}>
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  <Calendar className="w-4 h-4 mr-2" />
                  Activity Log
                </Button>
              </Link>
              <Link to={createPageUrl('AdminTimeTracking')}>
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                  <Calendar className="w-4 h-4 mr-2" />
                  Time Tracking
                </Button>
              </Link>
              <a href="https://docs.google.com/document/d/13wbZvo0AVYl2bqEgaAM2uMtKf0r2Mx48/edit" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Sponsorship Kit
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FundraisingProgress companies={companies || []} />
          <MilestoneTracker companies={companies || []} />
          <ActivityTracker />
        </div>

        <div className="grid grid-cols-1 gap-6">
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
                  <div key={task.id} className="border-l-4 border-orange-400 pl-3 py-2 flex items-start justify-between group">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-gray-600">
                        Due: {format(new Date(task.deadline), 'MMM d, yyyy')}
                        {task.assigned_to && <span className="ml-2">• {task.assigned_to}</span>}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleTakeOwnership(task)}
                      disabled={task.assigned_to === user?.email || updateTaskMutation.isPending}
                      title={task.assigned_to === user?.email ? "Already assigned to you" : "Take ownership"}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
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