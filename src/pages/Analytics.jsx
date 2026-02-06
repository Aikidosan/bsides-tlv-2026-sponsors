import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, DollarSign, Users, Target, Mail, Phone, Linkedin, Calendar, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ConversionFunnel from '../components/analytics/ConversionFunnel';
import OutreachEffectiveness from '../components/analytics/OutreachEffectiveness';
import SponsorshipTiers from '../components/analytics/SponsorshipTiers';
import TimelineTrends from '../components/analytics/TimelineTrends';

export default function Analytics() {
  const navigate = useNavigate();
  
  const { data: companies, isLoading: loadingCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => base44.entities.Company.list(),
  });

  const { data: touches, isLoading: loadingTouches } = useQuery({
    queryKey: ['outreach_touches'],
    queryFn: () => base44.entities.OutreachTouch.list('-touch_date'),
  });

  if (loadingCompanies || loadingTouches) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  // Calculate KPIs
  const totalLeads = companies?.length || 0;
  const committedCompanies = companies?.filter(c => ['committed', 'closed'].includes(c.status)) || [];
  const conversionRate = totalLeads > 0 ? ((committedCompanies.length / totalLeads) * 100).toFixed(1) : 0;
  
  const totalRevenue = companies?.reduce((sum, c) => sum + (c.sponsorship_amount || 0), 0) || 0;
  const avgSponsorshipValue = committedCompanies.length > 0 
    ? (committedCompanies.reduce((sum, c) => sum + (c.sponsorship_amount || 0), 0) / committedCompanies.length).toFixed(0)
    : 0;

  const totalTouches = touches?.length || 0;
  const responsesReceived = touches?.filter(t => t.response_received)?.length || 0;
  const responseRate = totalTouches > 0 ? ((responsesReceived / totalTouches) * 100).toFixed(1) : 0;

  // Outreach by type
  const touchesByType = touches?.reduce((acc, t) => {
    acc[t.touch_type] = (acc[t.touch_type] || 0) + 1;
    return acc;
  }, {}) || {};

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
              <h1 className="text-3xl font-bold">Sponsor Analytics</h1>
              <p className="text-gray-600">Performance insights and key metrics</p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card 
            className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 cursor-pointer hover:shadow-lg transition-all group"
            onClick={() => navigate(createPageUrl('Sponsors'))}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Total Leads
                </div>
                <ExternalLink className="w-3 h-3 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-900">{totalLeads}</p>
              <p className="text-xs text-blue-700 mt-1">Companies in pipeline</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 cursor-pointer hover:shadow-lg transition-all group"
            onClick={() => navigate(createPageUrl('Sponsors') + '?status=committed,closed')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-600" />
                  Conversion Rate
                </div>
                <ExternalLink className="w-3 h-3 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-900">{conversionRate}%</p>
              <p className="text-xs text-green-700 mt-1">{committedCompanies.length} committed</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 cursor-pointer hover:shadow-lg transition-all group"
            onClick={() => navigate(createPageUrl('Sponsors') + '?status=committed,closed')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                  Total Revenue
                </div>
                <ExternalLink className="w-3 h-3 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-900">${(totalRevenue / 1000).toFixed(0)}K</p>
              <p className="text-xs text-purple-700 mt-1">Avg: ${avgSponsorshipValue}</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 cursor-pointer hover:shadow-lg transition-all group"
            onClick={() => navigate(createPageUrl('OutreachTracker'))}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  Response Rate
                </div>
                <ExternalLink className="w-3 h-3 text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-900">{responseRate}%</p>
              <p className="text-xs text-orange-700 mt-1">{responsesReceived} of {totalTouches} touches</p>
            </CardContent>
          </Card>
        </div>

        {/* Outreach Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Outreach Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div 
                className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors group"
                onClick={() => navigate(createPageUrl('OutreachTracker'))}
              >
                <Linkedin className="w-6 h-6 text-blue-600" />
                <div className="flex-1">
                  <p className="text-2xl font-bold text-blue-900">{touchesByType.linkedin || 0}</p>
                  <p className="text-xs text-blue-700 flex items-center gap-1">
                    LinkedIn
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                </div>
              </div>
              <div 
                className="flex items-center gap-3 p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors group"
                onClick={() => navigate(createPageUrl('OutreachTracker'))}
              >
                <Mail className="w-6 h-6 text-green-600" />
                <div className="flex-1">
                  <p className="text-2xl font-bold text-green-900">{touchesByType.email || 0}</p>
                  <p className="text-xs text-green-700 flex items-center gap-1">
                    Emails
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                </div>
              </div>
              <div 
                className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors group"
                onClick={() => navigate(createPageUrl('OutreachTracker'))}
              >
                <Phone className="w-6 h-6 text-purple-600" />
                <div className="flex-1">
                  <p className="text-2xl font-bold text-purple-900">{touchesByType.phone || 0}</p>
                  <p className="text-xs text-purple-700 flex items-center gap-1">
                    Calls
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                </div>
              </div>
              <div 
                className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors group"
                onClick={() => navigate(createPageUrl('OutreachTracker'))}
              >
                <Calendar className="w-6 h-6 text-orange-600" />
                <div className="flex-1">
                  <p className="text-2xl font-bold text-orange-900">{touchesByType.meeting || 0}</p>
                  <p className="text-xs text-orange-700 flex items-center gap-1">
                    Meetings
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                </div>
              </div>
              <div 
                className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors group"
                onClick={() => navigate(createPageUrl('OutreachTracker'))}
              >
                <Target className="w-6 h-6 text-indigo-600" />
                <div className="flex-1">
                  <p className="text-2xl font-bold text-indigo-900">{touchesByType.proposal || 0}</p>
                  <p className="text-xs text-indigo-700 flex items-center gap-1">
                    Proposals
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ConversionFunnel companies={companies} />
          <OutreachEffectiveness touches={touches} />
          <SponsorshipTiers companies={companies} />
          <TimelineTrends companies={companies} touches={touches} />
        </div>
      </div>
    </div>
  );
}