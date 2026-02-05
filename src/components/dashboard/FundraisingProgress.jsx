import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Target, TrendingUp, Building2 } from "lucide-react";

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-600">Total Companies</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{companies?.length || 0}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-700">Committed</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{statusCounts.committed || 0}</p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-700">Negotiating</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{statusCounts.negotiating || 0}</p>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-yellow-700">In Progress</span>
            </div>
            <p className="text-2xl font-bold text-yellow-900">
              {(statusCounts.contacted || 0) + (statusCounts.responded || 0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}