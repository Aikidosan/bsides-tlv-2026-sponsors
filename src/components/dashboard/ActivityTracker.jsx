import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Activity, Save, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export default function ActivityTracker() {
  const [isLogging, setIsLogging] = useState(false);
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: todayActivity } = useQuery({
    queryKey: ['todayActivity', today],
    queryFn: async () => {
      const activities = await base44.entities.DailyActivity.filter({
        date: today,
        team_member: user?.email
      });
      return activities[0] || null;
    },
    enabled: !!user,
  });

  const [formData, setFormData] = useState({
    linkedin_contacts: 0,
    emails_sent: 0,
    phone_calls: 0,
    meetings_held: 0,
    proposals_sent: 0,
    notes: ''
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (todayActivity) {
        return base44.entities.DailyActivity.update(todayActivity.id, data);
      } else {
        return base44.entities.DailyActivity.create({
          ...data,
          date: today,
          team_member: user.email
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['todayActivity']);
      setIsLogging(false);
    },
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  React.useEffect(() => {
    if (todayActivity) {
      setFormData({
        linkedin_contacts: todayActivity.linkedin_contacts || 0,
        emails_sent: todayActivity.emails_sent || 0,
        phone_calls: todayActivity.phone_calls || 0,
        meetings_held: todayActivity.meetings_held || 0,
        proposals_sent: todayActivity.proposals_sent || 0,
        notes: todayActivity.notes || ''
      });
    }
  }, [todayActivity]);

  const totalTouches = (todayActivity?.linkedin_contacts || 0) + 
                       (todayActivity?.emails_sent || 0) + 
                       (todayActivity?.phone_calls || 0);

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Today's Activity
          </div>
          {todayActivity && (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isLogging ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-gray-600">Contacts Made</p>
                <p className="text-2xl font-bold text-blue-600">{totalTouches}</p>
                <p className="text-xs text-gray-500">Target: 15-20</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-gray-600">Meetings</p>
                <p className="text-2xl font-bold text-green-600">{todayActivity?.meetings_held || 0}</p>
                <p className="text-xs text-gray-500">Target: 3-5</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white rounded p-2 border">
                <p className="text-gray-600">LinkedIn</p>
                <p className="font-bold text-blue-600">{todayActivity?.linkedin_contacts || 0}</p>
              </div>
              <div className="bg-white rounded p-2 border">
                <p className="text-gray-600">Emails</p>
                <p className="font-bold text-purple-600">{todayActivity?.emails_sent || 0}</p>
              </div>
              <div className="bg-white rounded p-2 border">
                <p className="text-gray-600">Calls</p>
                <p className="font-bold text-orange-600">{todayActivity?.phone_calls || 0}</p>
              </div>
            </div>

            <Button 
              onClick={() => setIsLogging(true)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Log Activity
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">LinkedIn Contacts</Label>
                <Input
                  type="number"
                  value={formData.linkedin_contacts}
                  onChange={(e) => setFormData({...formData, linkedin_contacts: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label className="text-xs">Emails Sent</Label>
                <Input
                  type="number"
                  value={formData.emails_sent}
                  onChange={(e) => setFormData({...formData, emails_sent: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label className="text-xs">Phone Calls</Label>
                <Input
                  type="number"
                  value={formData.phone_calls}
                  onChange={(e) => setFormData({...formData, phone_calls: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label className="text-xs">Meetings</Label>
                <Input
                  type="number"
                  value={formData.meetings_held}
                  onChange={(e) => setFormData({...formData, meetings_held: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            
            <div>
              <Label className="text-xs">Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Key highlights from today..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => setIsLogging(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}