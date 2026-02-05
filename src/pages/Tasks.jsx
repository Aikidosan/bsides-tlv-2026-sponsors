import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tantml/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft, LayoutGrid, AlertCircle, User, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import TaskBoard from '../components/tasks/TaskBoard';
import TaskDialog from '../components/tasks/TaskDialog';
import TaskAIAssistant from '../components/tasks/TaskAIAssistant';
import UrgencyView from '../components/tasks/UrgencyView';
import OwnerView from '../components/tasks/OwnerView';
import TimelineView from '../components/tasks/TimelineView';

export default function Tasks() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);
  const [viewMode, setViewMode] = useState('status');
  const queryClient = useQueryClient();

  // Handle URL parameters for status filter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const statusParam = urlParams.get('status');
    if (statusParam) {
      setStatusFilter(statusParam);
    }
  }, []);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-updated_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      setShowDialog(false);
      setSelectedTask(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      setShowDialog(false);
      setSelectedTask(null);
    },
  });

  const handleSave = (data) => {
    if (selectedTask) {
      updateMutation.mutate({ id: selectedTask.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleStatusChange = (task, newStatus) => {
    updateMutation.mutate({ id: task.id, data: { ...task, status: newStatus } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Task Board</h1>
              <p className="text-gray-600">Organize team tasks toward June 2026</p>
            </div>
          </div>
          <Button 
            onClick={() => {
              setSelectedTask(null);
              setShowDialog(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* View Switcher */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex gap-2 overflow-x-auto">
            <Button
              variant={viewMode === 'status' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('status')}
              className="whitespace-nowrap"
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              By Status
            </Button>
            <Button
              variant={viewMode === 'urgency' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('urgency')}
              className="whitespace-nowrap"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              By Urgency
            </Button>
            <Button
              variant={viewMode === 'owner' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('owner')}
              className="whitespace-nowrap"
            >
              <User className="w-4 h-4 mr-2" />
              By Owner
            </Button>
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('timeline')}
              className="whitespace-nowrap"
            >
              <Calendar className="w-4 h-4 mr-2" />
              By Timeline
            </Button>
          </div>
        </div>

        {/* Task Views */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading tasks...</p>
          </div>
        ) : (
          <>
            {viewMode === 'status' && (
              <TaskBoard
                tasks={tasks || []}
                onTaskClick={(task, openAI = false) => {
                  setSelectedTask(task);
                  if (openAI) {
                    setShowAIAssistant(true);
                  } else {
                    setShowDialog(true);
                  }
                }}
                onStatusChange={handleStatusChange}
                highlightStatus={statusFilter}
              />
            )}
            {viewMode === 'urgency' && (
              <UrgencyView
                tasks={tasks || []}
                onTaskClick={(task, openAI = false) => {
                  setSelectedTask(task);
                  if (openAI) {
                    setShowAIAssistant(true);
                  } else {
                    setShowDialog(true);
                  }
                }}
                onStatusChange={handleStatusChange}
              />
            )}
            {viewMode === 'owner' && (
              <OwnerView
                tasks={tasks || []}
                onTaskClick={(task, openAI = false) => {
                  setSelectedTask(task);
                  if (openAI) {
                    setShowAIAssistant(true);
                  } else {
                    setShowDialog(true);
                  }
                }}
                onStatusChange={handleStatusChange}
              />
            )}
            {viewMode === 'timeline' && (
              <TimelineView
                tasks={tasks || []}
                onTaskClick={(task, openAI = false) => {
                  setSelectedTask(task);
                  if (openAI) {
                    setShowAIAssistant(true);
                  } else {
                    setShowDialog(true);
                  }
                }}
                onStatusChange={handleStatusChange}
              />
            )}
          </>
        )}

        {/* Task Dialog */}
        {showDialog && (
          <TaskDialog
            task={selectedTask}
            onClose={() => {
              setShowDialog(false);
              setSelectedTask(null);
            }}
            onSave={handleSave}
            isSaving={createMutation.isPending || updateMutation.isPending}
          />
        )}

        {/* AI Assistant */}
        {showAIAssistant && selectedTask && (
          <TaskAIAssistant
            task={selectedTask}
            onClose={() => {
              setShowAIAssistant(false);
              setSelectedTask(null);
            }}
          />
        )}
      </div>
    </div>
  );
}