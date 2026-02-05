import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X } from 'lucide-react';

export default function CompanyDialog({ company, onClose, onSave, isSaving }) {
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    industry: '',
    size: 'medium',
    status: 'research',
    contact_name: '',
    contact_title: '',
    contact_email: '',
    contact_phone: '',
    linkedin_url: '',
    sponsorship_amount: 0,
    sponsorship_tier: '',
    notes: '',
    next_followup_date: '',
    stock_symbol: '',
    ...company
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{company ? 'Edit Company' : 'Add New Company'}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Acme Cyber Security"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry Focus</Label>
            <Input
              id="industry"
              value={formData.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
              placeholder="Cloud Security, IoT, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="size">Company Size</Label>
            <Select value={formData.size} onValueChange={(v) => handleChange('size', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="startup">Startup</SelectItem>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
                <SelectItem value="negotiating">Negotiating</SelectItem>
                <SelectItem value="committed">Committed</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="next_followup_date">Next Follow-up</Label>
            <Input
              id="next_followup_date"
              type="date"
              value={formData.next_followup_date}
              onChange={(e) => handleChange('next_followup_date', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock_symbol">Stock Symbol</Label>
            <Input
              id="stock_symbol"
              value={formData.stock_symbol}
              onChange={(e) => handleChange('stock_symbol', e.target.value.toUpperCase())}
              placeholder="PANW, CHKP, etc."
            />
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold mb-4">Key Contacts</h3>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">CFO</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="CFO Name"
                  value={formData.cfo_name}
                  onChange={(e) => handleChange('cfo_name', e.target.value)}
                />
                <Input
                  placeholder="CFO Email"
                  type="email"
                  value={formData.cfo_email}
                  onChange={(e) => handleChange('cfo_email', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">CTO</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="CTO Name"
                  value={formData.cto_name}
                  onChange={(e) => handleChange('cto_name', e.target.value)}
                />
                <Input
                  placeholder="CTO Email"
                  type="email"
                  value={formData.cto_email}
                  onChange={(e) => handleChange('cto_email', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">HR Director</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="HR Name"
                  value={formData.hr_name}
                  onChange={(e) => handleChange('hr_name', e.target.value)}
                />
                <Input
                  placeholder="HR Email"
                  type="email"
                  value={formData.hr_email}
                  onChange={(e) => handleChange('hr_email', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Other Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_name">Contact Name</Label>
                <Input
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) => handleChange('contact_name', e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_title">Title</Label>
                <Input
                  id="contact_title"
                  value={formData.contact_title}
                  onChange={(e) => handleChange('contact_title', e.target.value)}
                  placeholder="CMO, VP Sales"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone">Phone</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  placeholder="+972-XX-XXX-XXXX"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input
                  id="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={(e) => handleChange('linkedin_url', e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold mb-4">Sponsorship Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sponsorship_amount">Amount (USD)</Label>
              <Input
                id="sponsorship_amount"
                type="number"
                value={formData.sponsorship_amount}
                onChange={(e) => handleChange('sponsorship_amount', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sponsorship_tier">Tier</Label>
              <Select value={formData.sponsorship_tier} onValueChange={(v) => handleChange('sponsorship_tier', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="platinum">Platinum</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="bronze">Bronze</SelectItem>
                  <SelectItem value="supporter">Supporter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Research notes, conversation history, next steps..."
            rows={4}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={() => onSave(formData)}
            disabled={!formData.name || isSaving}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}