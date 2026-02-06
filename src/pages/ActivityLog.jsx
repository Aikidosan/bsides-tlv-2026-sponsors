import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Search, Activity, User, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function ActivityLog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 200),
  });

  const filteredLogs = logs?.filter(log => {
    const matchesSearch = !searchTerm || 
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === 'all' || log.action?.includes(filterAction);
    
    return matchesSearch && matchesAction;
  }) || [];

  const getActionIcon = (action) => {
    if (action?.includes('created')) return '➕';
    if (action?.includes('updated')) return '✏️';
    if (action?.includes('deleted')) return '🗑️';
    if (action?.includes('email')) return '📧';
    if (action?.includes('research')) return '🔍';
    return '📝';
  };

  const getActionColor = (action) => {
    if (action?.includes('created')) return 'border-green-400 bg-green-50';
    if (action?.includes('updated')) return 'border-blue-400 bg-blue-50';
    if (action?.includes('deleted')) return 'border-red-400 bg-red-50';
    if (action?.includes('email')) return 'border-purple-400 bg-purple-50';
    return 'border-gray-400 bg-gray-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Activity className="w-6 h-6 text-indigo-600" />
                <h1 className="text-3xl font-bold">Activity Log</h1>
              </div>
              <p className="text-gray-600 mt-1">Track all user actions and changes</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'created', 'updated', 'deleted', 'email', 'research'].map(action => (
                <Button
                  key={action}
                  variant={filterAction === action ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterAction(action)}
                >
                  {action === 'all' ? 'All' : action.charAt(0).toUpperCase() + action.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <Card className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading activities...</p>
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="space-y-4">
              {filteredLogs.map((log, index) => (
                <div
                  key={log.id}
                  className={`border-l-4 pl-4 py-3 rounded-r-lg ${getActionColor(log.action)}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getActionIcon(log.action)}</span>
                        <span className="font-semibold text-gray-900">
                          {log.action?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </span>
                      </div>
                      
                      {log.entity_name && (
                        <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                          <FileText className="w-3 h-3" />
                          <span className="font-medium">{log.entity_type}:</span>
                          <span>{log.entity_name}</span>
                        </div>
                      )}
                      
                      {log.details && (
                        <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{log.user_name || log.user_email || log.created_by}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(log.created_date), 'MMM d, yyyy h:mm a')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No activities found</p>
              <p className="text-sm text-gray-400 mt-2">Start using the app to see activity logs here</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}