import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Target, TrendingUp, Building2 } from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function FundraisingProgress({ companies }) {
  const TARGET_MIN = 350000;
  const TARGET_MAX = 500000;
  
  const totalRaised = companies?.reduce((sum, c) => sum + (c.sponsorship_amount || 0), 0) || 0;
  const percentageMin = Math.min((totalRaised / TARGET_MIN) * 100, 100);
  const percentageMax = (totalRaised / TARGET_MAX) * 100;
  
  const statusCounts = companies?.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {}) || {};

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-900">
          <Target className="w-5 h-5" />
          Fundraising Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-3xl font-bold text-indigo-900">
              ${totalRaised.toLocaleString()}
            </span>
            <span className="text-sm text-gray-600">
              ${TARGET_MIN.toLocaleString()} - ${TARGET_MAX.toLocaleString()} goal
            </span>
          </div>
          <Progress value={percentageMin} className="h-3 bg-indigo-100" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{percentageMin.toFixed(1)}% of minimum goal</span>
            <span>{percentageMax.toFixed(1)}% of maximum goal</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to={createPageUrl('Sponsors')}>
            <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer text-center">
              <p className="text-sm font-semibold text-gray-700 mb-4">Target Companies</p>
              <p className="text-4xl font-bold text-gray-900 mb-3">{companies?.length || 0}</p>
              <Progress value={Math.min(((companies?.length || 0) / 200) * 100, 100)} className="h-2 mb-2" />
              <p className="text-xs text-gray-600">{Math.min(((companies?.length || 0) / 200) * 100, 100).toFixed(0)}% of goal reached</p>
            </div>
          </Link>
          
          <Link to={createPageUrl('Sponsors') + '?status=contacted,responded'}>
            <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer text-center">
              <p className="text-sm font-semibold text-gray-700 mb-4">Outreach Started</p>
              <p className="text-4xl font-bold text-gray-900 mb-3">
                {(statusCounts.contacted || 0) + (statusCounts.responded || 0)}
              </p>
              <p className="text-xs text-gray-600">Companies contacted via LinkedIn/Email</p>
            </div>
          </Link>
          
          <Link to={createPageUrl('Tasks') + '?category=fundraising'}>
            <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer text-center">
              <p className="text-sm font-semibold text-gray-700 mb-4">Meetings Scheduled</p>
              <p className="text-4xl font-bold text-gray-900 mb-3">{statusCounts.negotiating || 0}</p>
              <p className="text-xs text-gray-600">Virtual meetings with prospects</p>
            </div>
          </Link>
          
          <Link to={createPageUrl('Sponsors') + '?status=committed,closed'}>
            <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all cursor-pointer text-center">
              <p className="text-sm font-semibold text-gray-700 mb-4">Commitments</p>
              <p className="text-4xl font-bold text-gray-900 mb-3">
                {(statusCounts.committed || 0) + (statusCounts.closed || 0)}
              </p>
              <p className="text-xs text-gray-600">Sponsors committed or closed</p>
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}