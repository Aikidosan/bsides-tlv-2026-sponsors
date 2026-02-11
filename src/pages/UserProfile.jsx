import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Linkedin, CheckCircle, ArrowLeft, Loader2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function UserProfile() {
  const queryClient = useQueryClient();
  const [linkedinProfile, setLinkedinProfile] = useState('');
  const [calendlyUrl, setCalendlyUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingCalendly, setIsEditingCalendly] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  React.useEffect(() => {
    if (user?.linkedin_profile) {
      setLinkedinProfile(user.linkedin_profile);
    }
    if (user?.calendly_url) {
      setCalendlyUrl(user.calendly_url);
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
      setIsEditing(false);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      linkedin_profile: linkedinProfile
    });
  };

  const handleSaveCalendly = () => {
    updateMutation.mutate({
      calendly_url: calendlyUrl
    });
    setIsEditingCalendly(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="icon" className="bg-white/80 backdrop-blur-sm hover:bg-white/90">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600">Manage your account settings</p>
          </div>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <CardTitle>{user?.full_name || 'User'}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Role</p>
                <p className="font-medium capitalize">{user?.role || 'User'}</p>
              </div>
              <div>
                <p className="text-gray-500">LinkedIn Status</p>
                <div className="flex items-center gap-2">
                  {user?.linkedin_verified ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-600">Verified</span>
                    </>
                  ) : (
                    <span className="font-medium text-gray-600">Not Verified</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LinkedIn Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Linkedin className="w-5 h-5 text-blue-600" />
                <CardTitle>LinkedIn Profile</CardTitle>
              </div>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    LinkedIn Profile URL
                  </label>
                  <Input
                    placeholder="https://www.linkedin.com/in/your-profile"
                    value={linkedinProfile}
                    onChange={(e) => setLinkedinProfile(e.target.value)}
                    disabled={updateMutation.isPending}
                  />
                  <p className="text-xs text-gray-500">
                    Enter your full LinkedIn profile URL
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={updateMutation.isPending || !linkedinProfile}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setLinkedinProfile(user?.linkedin_profile || '');
                    }}
                    disabled={updateMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Current Profile URL</p>
                {user?.linkedin_profile ? (
                  <a
                    href={user.linkedin_profile.startsWith('http') ? user.linkedin_profile : `https://${user.linkedin_profile}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {user.linkedin_profile}
                  </a>
                ) : (
                  <p className="text-gray-400">No LinkedIn profile set</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calendly Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <CardTitle>Calendly Booking Link</CardTitle>
              </div>
              {!isEditingCalendly && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingCalendly(true)}
                >
                  Edit
                </Button>
              )}
            </div>
            <CardDescription>
              Share your Calendly link for easy meeting scheduling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditingCalendly ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Calendly Link
                  </label>
                  <Input
                    placeholder="https://calendly.com/your-username"
                    value={calendlyUrl}
                    onChange={(e) => setCalendlyUrl(e.target.value)}
                    disabled={updateMutation.isPending}
                  />
                  <p className="text-xs text-gray-500">
                    Enter your Calendly booking link
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveCalendly}
                    disabled={updateMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingCalendly(false);
                      setCalendlyUrl(user?.calendly_url || '');
                    }}
                    disabled={updateMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Current Calendly Link</p>
                {user?.calendly_url ? (
                  <a
                    href={user.calendly_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline break-all"
                  >
                    {user.calendly_url}
                  </a>
                ) : (
                  <p className="text-gray-400">No Calendly link set</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}