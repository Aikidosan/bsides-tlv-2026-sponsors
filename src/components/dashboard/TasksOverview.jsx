import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function TasksOverview({ tasks }) {
  const EVENT_DATE = new Date('2026-06-01');
  const today = new Date();
  const daysUntilEvent = differenceInDays(EVENT_DATE, today);
  
  const done = tasks?.filter(t => t.status === 'done').length || 0;
  const inProgress = tasks?.filter(t => t.status === 'in_progress').length || 0;
  const todo = tasks?.filter(t => t.status === 'todo').length || 0;
  const total = tasks?.length || 0;
  
  const completionRate = total > 0 ? (done / total) * 100 : 0;
  
  const overdue = tasks?.filter(t => {
    if (!t.deadline || t.status === 'done') return false;
    return new Date(t.deadline) < today;
  }).length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Tasks Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-2xl font-bold">{done}/{total} Complete</span>
            <span className="text-sm text-gray-600">{completionRate.toFixed(0)}%</span>
          </div>
          <Progress value={completionRate} className="h-3" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-700">In Progress</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{inProgress}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-600">To Do</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{todo}</p>
          </div>
        </div>

        {overdue > 0 && (
          <div className="bg-red-50 rounded-lg p-3 border border-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700 font-medium">
                {overdue} overdue task{overdue !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">BSides TLV 2026</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {daysUntilEvent} days left
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}