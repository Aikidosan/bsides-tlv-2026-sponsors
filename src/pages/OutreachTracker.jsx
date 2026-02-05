import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Linkedin, Mail, Phone, Calendar, Plus, CheckCircle2, Clock } from 'lucide-react';
import { format, differenceInHours } from 'date-fns';
import OutreachDialog from '../components/outreach/OutreachDialog';

const touchIcons = {
  linkedin: { icon: Linkedin, color: 'text-blue-600', bg: 'bg-blue-50' },
  email: { icon: Mail, color: 'text-purple-600', bg: 'bg-purple-50' },
  phone: { icon: Phone, color: 'text-orange-600', bg: 'bg-orange-50' },
  meeting: { icon: Calendar, color: 'text-green-600', bg: 'bg-green-50' },
  proposal: { icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-50' }
};

export default function OutreachTracker() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const queryClient = useQueryClient();

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => base44.entities.Company.list('-updated_date'),
  });

  const { data: touches } = useQuery({
    queryKey: ['touches'],
    queryFn: () => base44.entities.OutreachTouch.list('-touch_date'),
  });

  const createTouch = useMutation({
    mutationFn: (data) => base44.entities.OutreachTouch.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['touches']);
      setShowDialog(false);
    },
  });

  // Group touches by company
  const touchesByCompany = touches?.reduce((acc, touch) => {
    if (!acc[touch.company_id]) acc[touch.company_id] = [];
    acc[touch.company_id].push(touch);
    return acc;
  }, {}) || {};

  // Get companies with pending next touches
  const pendingTouches = touches?.filter(t => 
    t.next_touch_date && new Date(t.next_touch_date) <= new Date()
  ) || [];

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
              <h1 className="text-3xl font-bold">Outreach Workflow Tracker</h1>
              <p className="text-gray-600">LinkedIn → Email (24h) → Phone (48h) → Meeting</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowDialog(true)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Log Touch
          </Button>
        </div>

        {/* Pending Touches Alert */}
        {pendingTouches.length > 0 && (
          <Card className="border-orange-300 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <Clock className="w-5 h-5" />
                {pendingTouches.length} Pending Follow-ups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pendingTouches.slice(0, 5).map(touch => {
                  const company = companies?.find(c => c.id === touch.company_id);
                  const hoursOverdue = differenceInHours(new Date(), new Date(touch.next_touch_date));
                  
                  return (
                    <div key={touch.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-orange-200">
                      <div>
                        <p className="font-semibold">{company?.name || 'Unknown Company'}</p>
                        <p className="text-sm text-gray-600">{touch.contact_name}</p>
                        <p className="text-xs text-orange-600">
                          {touch.next_touch_type} overdue by {hoursOverdue}h
                        </p>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => {
                          setSelectedCompany(company);
                          setShowDialog(true);
                        }}
                      >
                        Log Now
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Outreach Timeline by Company */}
        <div className="space-y-4">
          {companies?.filter(c => c.status === 'research' || c.status === 'contacted' || c.status === 'responded').map(company => {
            const companyTouches = touchesByCompany[company.id] || [];
            const lastTouch = companyTouches[0];
            
            return (
              <Card key={company.id} className="border-l-4 border-l-indigo-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{company.name}</CardTitle>
                      <p className="text-sm text-gray-600">{company.contact_name}</p>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => {
                        setSelectedCompany(company);
                        setShowDialog(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Touch
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {companyTouches.length > 0 ? (
                    <div className="space-y-3">
                      {companyTouches.map((touch, idx) => {
                        const config = touchIcons[touch.touch_type];
                        const Icon = config.icon;
                        
                        return (
                          <div key={touch.id} className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${config.bg}`}>
                              <Icon className={`w-4 h-4 ${config.color}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">{touch.touch_type}</Badge>
                                <span className="text-xs text-gray-500">
                                  {format(new Date(touch.touch_date), 'MMM d, h:mm a')}
                                </span>
                                {touch.response_received && (
                                  <Badge className="bg-green-100 text-green-800">Responded</Badge>
                                )}
                              </div>
                              {touch.content && (
                                <p className="text-sm text-gray-700">{touch.content}</p>
                              )}
                              {touch.next_touch_type && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Next: {touch.next_touch_type} on {format(new Date(touch.next_touch_date), 'MMM d')}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No outreach touches logged yet</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Outreach Dialog */}
        {showDialog && (
          <OutreachDialog
            company={selectedCompany}
            companies={companies || []}
            onClose={() => {
              setShowDialog(false);
              setSelectedCompany(null);
            }}
            onSave={(data) => createTouch.mutate(data)}
            isSaving={createTouch.isPending}
          />
        )}
      </div>
    </div>
  );
}