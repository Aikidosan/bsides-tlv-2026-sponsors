import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function OutreachDialog({ company, companies, onClose, onSave, isSaving }) {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const [formData, setFormData] = useState({
    company_id: company?.id || '',
    contact_name: company?.contact_name || '',
    touch_type: 'linkedin',
    touch_date: new Date().toISOString(),
    next_touch_type: 'email',
    next_touch_date: '',
    content: '',
    response_received: false,
    team_member: ''
  });

  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, team_member: user.email }));
    }
  }, [user]);

  React.useEffect(() => {
    if (formData.touch_type && formData.touch_date) {
      const touchDate = new Date(formData.touch_date);
      let nextDate;
      let nextType;

      switch (formData.touch_type) {
        case 'linkedin':
          nextDate = new Date(touchDate.getTime() + 24 * 60 * 60 * 1000); // +24h
          nextType = 'email';
          break;
        case 'email':
          nextDate = new Date(touchDate.getTime() + 48 * 60 * 60 * 1000); // +48h
          nextType = 'phone';
          break;
        case 'phone':
          nextDate = new Date(touchDate.getTime() + 24 * 60 * 60 * 1000); // +24h
          nextType = 'meeting';
          break;
        default:
          nextDate = null;
          nextType = 'follow_up';
      }

      if (nextDate) {
        setFormData(prev => ({
          ...prev,
          next_touch_date: nextDate.toISOString().slice(0, 16),
          next_touch_type: nextType
        }));
      }
    }
  }, [formData.touch_type, formData.touch_date]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Log Outreach Touch</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Company</Label>
            <Select value={formData.company_id} onValueChange={(v) => {
              const selectedCompany = companies.find(c => c.id === v);
              setFormData({
                ...formData, 
                company_id: v,
                contact_name: selectedCompany?.contact_name || ''
              });
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Contact Name</Label>
            <Input
              value={formData.contact_name}
              onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
              placeholder="John Doe"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Touch Type</Label>
              <Select value={formData.touch_type} onValueChange={(v) => setFormData({...formData, touch_type: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linkedin">LinkedIn Message</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="proposal">Proposal Sent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Touch Date/Time</Label>
              <Input
                type="datetime-local"
                value={formData.touch_date.slice(0, 16)}
                onChange={(e) => setFormData({...formData, touch_date: new Date(e.target.value).toISOString()})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Message/Notes</Label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="What did you say? Key points from conversation..."
              rows={4}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={formData.response_received}
              onCheckedChange={(checked) => setFormData({...formData, response_received: checked})}
            />
            <Label>Response received from prospect</Label>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Schedule Next Touch</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Next Touch Type</Label>
                <Select value={formData.next_touch_type} onValueChange={(v) => setFormData({...formData, next_touch_type: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Next Touch Date</Label>
                <Input
                  type="datetime-local"
                  value={formData.next_touch_date.slice(0, 16)}
                  onChange={(e) => setFormData({...formData, next_touch_date: new Date(e.target.value).toISOString()})}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={() => onSave(formData)}
            disabled={!formData.company_id || !formData.touch_type || isSaving}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Touch'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}