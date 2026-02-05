import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, Calendar, TrendingUp } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';

export default function MilestoneTracker({ companies }) {
  const milestones = [
    { date: '2026-03-01', target: 100000, proposals: 150000, label: 'Week 4' },
    { date: '2026-04-01', target: 250000, proposals: 100000, label: 'Week 8' },
    { date: '2026-05-01', target: 350000, proposals: 0, label: 'Week 12' },
    { date: '2026-06-01', target: 500000, proposals: 0, label: 'Final (Stretch)' }
  ];

  const committedAmount = companies?.filter(c => 
    c.status === 'committed' || c.status === 'closed'
  ).reduce((sum, c) => sum + (c.sponsorship_amount || 0), 0) || 0;

  const proposalsAmount = companies?.filter(c => 
    c.status === 'negotiating'
  ).reduce((sum, c) => sum + (c.sponsorship_amount || 0), 0) || 0;

  const today = new Date();
  const nextMilestone = milestones.find(m => new Date(m.date) > today) || milestones[milestones.length - 1];
  const daysUntilNext = differenceInDays(new Date(nextMilestone.date), today);
  const progressToNext = (committedAmount / nextMilestone.target) * 100;

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-600" />
          Campaign Milestones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Next Milestone */}
        <div className="bg-white rounded-lg p-4 border-2 border-indigo-300">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-gray-600">{nextMilestone.label} Target</p>
              <p className="text-2xl font-bold text-indigo-600">
                ${(nextMilestone.target / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-orange-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-semibold">{daysUntilNext} days</span>
              </div>
              <p className="text-xs text-gray-600">{format(new Date(nextMilestone.date), 'MMM d')}</p>
            </div>
          </div>
          <Progress value={Math.min(progressToNext, 100)} className="h-3" />
          <p className="text-xs text-gray-600 mt-1">
            ${(committedAmount / 1000).toFixed(0)}K committed ({progressToNext.toFixed(0)}%)
          </p>
        </div>

        {/* All Milestones */}
        <div className="space-y-2">
          {milestones.map((milestone, idx) => {
            const isPast = new Date(milestone.date) < today;
            const progress = (committedAmount / milestone.target) * 100;
            const achieved = committedAmount >= milestone.target;

            return (
              <div key={idx} className={`p-3 rounded-lg border ${achieved ? 'bg-green-50 border-green-300' : isPast ? 'bg-gray-50 border-gray-300' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-700">{milestone.label}</span>
                    <span className="text-xs text-gray-500">{format(new Date(milestone.date), 'MMM d')}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${achieved ? 'text-green-600' : 'text-gray-700'}`}>
                      ${(milestone.target / 1000).toFixed(0)}K
                    </span>
                  </div>
                </div>
                <Progress value={Math.min(progress, 100)} className="h-1.5" />
              </div>
            );
          })}
        </div>

        {/* Active Pipeline */}
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-semibold text-yellow-900">Active Pipeline</span>
          </div>
          <p className="text-xl font-bold text-yellow-600">
            ${(proposalsAmount / 1000).toFixed(0)}K in negotiations
          </p>
        </div>
      </CardContent>
    </Card>
  );
}