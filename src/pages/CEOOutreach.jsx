import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, Target, Users, Calendar, TrendingUp, 
  Building2, Mail, Linkedin, Phone, CheckCircle2, Clock, AlertCircle
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export default function CEOOutreach() {
  const queryClient = useQueryClient();
  const [weekFilter, setWeekFilter] = useState('all');

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => base44.entities.Company.list('-updated_date'),
  });

  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.filter({ assigned_to: 'ariel@bsidestlv.com', category: 'fundraising' }),
  });

  // Campaign Metrics
  const totalTargets = 200;
  const currentCompanies = companies?.length || 0;
  const targetProgress = (currentCompanies / totalTargets) * 100;

  const outreachStats = companies?.reduce((acc, c) => {
    if (c.status === 'contacted' || c.status === 'responded' || c.status === 'negotiating' || c.status === 'committed' || c.status === 'closed') {
      acc.contacted++;
    }
    if (c.status === 'negotiating' || c.status === 'committed' || c.status === 'closed') {
      acc.meetings++;
    }
    if (c.status === 'committed' || c.status === 'closed') {
      acc.committed++;
    }
    if (c.decision_makers && c.decision_makers.length > 0) {
      acc.withDecisionMakers++;
    }
    return acc;
  }, { contacted: 0, meetings: 0, committed: 0, withDecisionMakers: 0 }) || { contacted: 0, meetings: 0, committed: 0, withDecisionMakers: 0 };

  // Upcoming tasks
  const upcomingTasks = tasks?.filter(t => t.status !== 'done').sort((a, b) => {
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline) - new Date(b.deadline);
  }).slice(0, 5) || [];

  // Priority companies (negotiating or responded, with decision makers)
  const priorityCompanies = companies?.filter(c => 
    (c.status === 'negotiating' || c.status === 'responded') && 
    c.decision_makers && c.decision_makers.length > 0
  ).slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CEO Outreach Campaign</h1>
              <p className="text-gray-600">Strategic Partnerships & Executive Targeting</p>
            </div>
          </div>
          <Link to={createPageUrl('Sponsors')}>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Building2 className="w-4 h-4 mr-2" />
              View All Sponsors
            </Button>
          </Link>
        </div>

        {/* Campaign Goals */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Target Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-indigo-900">{currentCompanies}</span>
                  <span className="text-sm text-gray-600">/ {totalTargets}</span>
                </div>
                <Progress value={targetProgress} className="h-2 bg-indigo-100" />
                <p className="text-xs text-gray-600">{targetProgress.toFixed(0)}% of goal reached</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Outreach Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-blue-900">{outreachStats.contacted}</div>
                <p className="text-xs text-gray-600">Companies contacted via LinkedIn/Email</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Meetings Scheduled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-purple-900">{outreachStats.meetings}</div>
                <p className="text-xs text-gray-600">Virtual meetings with prospects</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Commitments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-green-900">{outreachStats.committed}</div>
                <p className="text-xs text-gray-600">Sponsors committed or closed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Milestones & Priority Companies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Upcoming Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length > 0 ? (
                <div className="space-y-3">
                  {upcomingTasks.map(task => {
                    const daysLeft = task.deadline ? differenceInDays(new Date(task.deadline), new Date()) : null;
                    const isOverdue = daysLeft !== null && daysLeft < 0;
                    const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;
                    
                    return (
                      <div 
                        key={task.id} 
                        className={`border-l-4 pl-3 py-2 ${
                          isOverdue ? 'border-red-500 bg-red-50' : 
                          isUrgent ? 'border-orange-500 bg-orange-50' : 
                          'border-blue-400 bg-blue-50'
                        }`}
                      >
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {task.deadline && (
                            <>
                              {isOverdue ? '⚠️ Overdue: ' : '📅 '}
                              {format(new Date(task.deadline), 'MMM d, yyyy')}
                              {daysLeft !== null && !isOverdue && ` (${daysLeft} days left)`}
                            </>
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">All milestones completed! 🎉</p>
              )}
            </CardContent>
          </Card>

          {/* Priority Prospects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Priority Prospects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {priorityCompanies.length > 0 ? (
                <div className="space-y-3">
                  {priorityCompanies.map(company => (
                    <Link key={company.id} to={createPageUrl('Sponsors')}>
                      <div className="border rounded-lg p-3 hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-sm">{company.name}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              {company.decision_makers?.length || 0} decision makers identified
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            company.status === 'negotiating' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {company.status}
                          </span>
                        </div>
                        {company.contact_name && (
                          <p className="text-xs text-gray-500 mt-2">
                            📞 {company.contact_name} - {company.contact_title}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No active negotiations yet. Start reaching out!</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Weekly Outreach Tracker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Linkedin className="w-5 h-5 text-blue-600" />
              Weekly Outreach Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">LinkedIn Outreach Target</span>
                  <span className="text-sm font-semibold text-gray-900">10-15 / week</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Monthly Meetings Goal</span>
                  <span className="text-sm font-semibold text-gray-900">15-20 meetings</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Campaign Duration</span>
                  <span className="text-sm font-semibold text-gray-900">6 weeks (Week 3-8)</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Decision Makers Status</h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Companies with DMs</span>
                  <span className="text-sm font-semibold text-green-700">{outreachStats.withDecisionMakers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Needs Research</span>
                  <span className="text-sm font-semibold text-orange-700">{currentCompanies - outreachStats.withDecisionMakers}</span>
                </div>
                <Progress 
                  value={(outreachStats.withDecisionMakers / currentCompanies) * 100} 
                  className="h-2 mt-2" 
                />
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Sponsorship Tiers</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">💎 Platinum</span>
                    <span className="font-semibold">$75-100K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">🥇 Gold</span>
                    <span className="font-semibold">$40-60K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">🥈 Silver</span>
                    <span className="font-semibold">$20-30K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">🥉 Bronze</span>
                    <span className="font-semibold">$10-15K</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strategy Overview */}
        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Target className="w-5 h-5" />
              Ariel's Strategic Framework
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-gray-900">Weeks 1-2: Strategic Setup</h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Build 150-200 company target list</li>
                  <li>Identify C-suite decision-makers</li>
                  <li>Set up AI-powered CRM with lead scoring</li>
                  <li>Create tiered sponsorship pitch</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-gray-900">Weeks 3-8: Executive Outreach</h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>10-15 LinkedIn messages weekly to CEOs/founders</li>
                  <li>Schedule 15-20 virtual meetings monthly</li>
                  <li>Omnichannel: LinkedIn + Email + Warm intros</li>
                  <li>Focus: Unit 8200 alumni, elite research community</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <h4 className="font-semibold text-sm text-gray-900 mb-2">Value Proposition Focus:</h4>
              <p className="text-sm text-gray-700">
                Premier platform to reach Israel's elite security research community (Unit 8200 alumni, researchers, CISOs). 
                Ideal for companies seeking Israeli market expansion, talent recruitment, or thought leadership positioning.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Task List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Active Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link to={createPageUrl('Tasks')}>
              <Button variant="outline" className="w-full mb-4">
                View All Tasks →
              </Button>
            </Link>
            {upcomingTasks.length > 0 ? (
              <div className="space-y-2">
                {upcomingTasks.map(task => {
                  const daysLeft = task.deadline ? differenceInDays(new Date(task.deadline), new Date()) : null;
                  const isOverdue = daysLeft !== null && daysLeft < 0;
                  
                  return (
                    <div 
                      key={task.id}
                      className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50 transition-all"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{task.title}</p>
                        {task.deadline && (
                          <p className={`text-xs mt-1 ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                            {isOverdue ? '⚠️ ' : '📅 '}
                            {format(new Date(task.deadline), 'MMM d, yyyy')}
                            {daysLeft !== null && !isOverdue && ` (${daysLeft} days)`}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${
                        task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No active milestones</p>
            )}
          </CardContent>
        </Card>

        {/* Priority Prospects */}
        {priorityCompanies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Hot Prospects - Ready for Outreach
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {priorityCompanies.map(company => (
                  <div key={company.id} className="border rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{company.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{company.industry}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        company.status === 'negotiating' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {company.status}
                      </span>
                    </div>

                    {company.decision_makers && company.decision_makers.length > 0 && (
                      <div className="space-y-2">
                        {company.decision_makers.slice(0, 2).map((dm, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs bg-gray-50 rounded p-2">
                            <div>
                              <p className="font-medium text-gray-900">{dm.name}</p>
                              <p className="text-gray-600">{dm.title}</p>
                            </div>
                            {dm.linkedin_url && (
                              <a 
                                href={dm.linkedin_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Linkedin className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        ))}
                        {company.decision_makers.length > 2 && (
                          <p className="text-xs text-gray-500 text-center">
                            +{company.decision_makers.length - 2} more
                          </p>
                        )}
                      </div>
                    )}

                    <Link to={createPageUrl('Sponsors')}>
                      <Button variant="outline" size="sm" className="w-full mt-3">
                        View Full Details →
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold mb-1">Ready to Scale Your Outreach?</h3>
                <p className="text-sm text-indigo-100">Use AI tools to accelerate decision-maker research and personalized messaging</p>
              </div>
              <div className="flex gap-2">
                <Link to={createPageUrl('AIResearch')}>
                  <Button variant="secondary" className="bg-white text-indigo-700 hover:bg-indigo-50">
                    AI Research Assistant
                  </Button>
                </Link>
                <Link to={createPageUrl('Sponsors')}>
                  <Button variant="outline" className="border-white text-white hover:bg-white/20">
                    Manage Pipeline
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}