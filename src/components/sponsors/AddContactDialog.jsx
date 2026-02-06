import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, X, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AddContactDialog({ company, onClose, onSave, isSaving }) {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    linkedin_url: '',
    email: '',
    phone: ''
  });
  const [isExtracting, setIsExtracting] = useState(false);

  const handleLinkedInPaste = async (url) => {
    if (!url || !url.includes('linkedin.com')) {
      return;
    }

    setIsExtracting(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract all available information from this LinkedIn profile: ${url}
        
        Return:
        - Full name
        - Current job title
        - Email address (if visible)
        - Phone number (if visible)
        - Company name
        - Location
        
        Be thorough and extract everything you can see.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            title: { type: "string" },
            email: { type: ["string", "null"] },
            phone: { type: ["string", "null"] },
            company: { type: ["string", "null"] },
            location: { type: ["string", "null"] }
          }
        }
      });

      if (response.name) {
        setFormData(prev => ({
          ...prev,
          name: response.name || prev.name,
          title: response.title || prev.title,
          email: response.email || prev.email,
          phone: response.phone || prev.phone
        }));
      }
    } catch (error) {
      console.error('Failed to extract LinkedIn data:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.title) {
      alert('Please fill in name and title');
      return;
    }

    const updatedDecisionMakers = [
      ...(company.decision_makers || []),
      formData
    ];

    onSave({
      decision_makers: updatedDecisionMakers
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Add Contact to {company.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              onClick={(e) => e.stopPropagation()}
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              onClick={(e) => e.stopPropagation()}
              placeholder="CEO, CTO, VP Marketing"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              onClick={(e) => e.stopPropagation()}
              placeholder="email@company.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              onClick={(e) => e.stopPropagation()}
              placeholder="+972-50-123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <div className="relative">
              <Input
                id="linkedin_url"
                value={formData.linkedin_url}
                onChange={(e) => {
                  const url = e.target.value;
                  setFormData({...formData, linkedin_url: url});
                }}
                onClick={(e) => e.stopPropagation()}
                onBlur={(e) => handleLinkedInPaste(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                disabled={isExtracting}
              />
              {isExtracting && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-indigo-600" />
              )}
            </div>
            {isExtracting && (
              <p className="text-xs text-indigo-600">Extracting profile info...</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Add Contact'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}