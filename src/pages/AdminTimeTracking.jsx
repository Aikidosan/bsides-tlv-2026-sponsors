import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Clock, User, FileText, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function AdminTimeTracking() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: timeTrackingData, isLoading } = useQuery({
    queryKey: ['timeTracking'],
    queryFn: () => base44.entities.TimeTracking.list('-session_start', 1000),
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  // Check if current user is admin
  const isAdmin = user?.email === 'a.mitiushkin@gmail.com' || user?.email === 'aikidosan8@gmail.com' || user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Access denied. Admin only.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter data by date
  const filteredData = timeTrackingData?.filter(item => {
    if (dateFilter === 'all') return true;
    const itemDate = new Date(item.session_start);
    const now = new Date();
    
    if (dateFilter === 'today') {
      return itemDate.toDateString() === now.toDateString();
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return itemDate >= weekAgo;
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return itemDate >= monthAgo;
    }
    return true;
  }) || [];

  // Aggregate data by user
  const userStats = {};
  filteredData.forEach(item => {
    if (!userStats[item.user_email]) {
      userStats[item.user_email] = {
        email: item.user_email,
        name: item.user_name,
        totalTime: 0,
        sessions: 0,
        pages: {}
      };
    }
    
    const duration = item.duration_seconds || 0;
    userStats[item.user_email].totalTime += duration;
    userStats[item.user_email].sessions += 1;
    
    if (!userStats[item.user_email].pages[item.page_name]) {
      userStats[item.user_email].pages[item.page_name] = 0;
    }
    userStats[item.user_email].pages[item.page_name] += duration;
  });

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const selectedUserData = selectedUser ? userStats[selectedUser] : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
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
                <h1 className="text-3xl font-bold text-gray-900">Time Tracking Dashboard</h1>
                <p className="text-gray-600">Monitor user activity across the system</p>
              </div>
            </div>
            <div className="flex gap-2">
              {['all', 'today', 'week', 'month'].map(filter => (
                <Button
                  key={filter}
                  variant={dateFilter === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDateFilter(filter)}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                <span className="text-2xl font-bold">{Object.keys(userStats).length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold">{filteredData.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold">
                  {formatDuration(Object.values(userStats).reduce((sum, u) => sum + u.totalTime, 0))}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <span className="text-2xl font-bold">
                  {formatDuration(
                    filteredData.length > 0
                      ? Math.round(Object.values(userStats).reduce((sum, u) => sum + u.totalTime, 0) / filteredData.length)
                      : 0
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User List and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.values(userStats).sort((a, b) => b.totalTime - a.totalTime).map(userData => (
                  <button
                    key={userData.email}
                    onClick={() => setSelectedUser(userData.email)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedUser === userData.email
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{userData.name}</p>
                        <p className="text-sm text-gray-600">{userData.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-indigo-600">{formatDuration(userData.totalTime)}</p>
                        <p className="text-sm text-gray-500">{userData.sessions} sessions</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected User Details */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedUserData ? `${selectedUserData.name} - Page Activity` : 'Select a user'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedUserData ? (
                <div className="space-y-4">
                  <div className="pb-4 border-b">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Time</p>
                        <p className="text-2xl font-bold text-indigo-600">
                          {formatDuration(selectedUserData.totalTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Sessions</p>
                        <p className="text-2xl font-bold">{selectedUserData.sessions}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900 mb-3">Time by Page</h3>
                    {Object.entries(selectedUserData.pages)
                      .sort((a, b) => b[1] - a[1])
                      .map(([page, time]) => (
                        <div key={page} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{page}</span>
                          <span className="text-indigo-600 font-bold">{formatDuration(time)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-12">
                  Select a user to view their activity details
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredData.slice(0, 20).map(session => (
                <div key={session.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{session.user_name}</p>
                    <p className="text-sm text-gray-600">{session.page_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-600">
                      {session.duration_seconds ? formatDuration(session.duration_seconds) : 'Active'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(session.session_start), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}