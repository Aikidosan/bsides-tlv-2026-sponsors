import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Linkedin, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const ALLOWED_PROFILES = [
  'linkedin.com/in/ariel-mitiushkin',
  'https://www.linkedin.com/in/guy-desau/',
  'https://www.linkedin.com/in/kerenlerner/',
  'https://www.linkedin.com/in/avital-aviv-a778b01b2/'
];

export default function LinkedInVerification() {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (url) => {
      try {
        const response = await base44.functions.invoke('verifyLinkedIn', { linkedin_url: url });
        return response.data;
      } catch (error) {
        // If the backend returned an error response with data, extract it
        if (error.response?.data) {
          throw new Error(error.response.data.message || 'Verification failed');
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data.verified) {
        queryClient.invalidateQueries(['user']);
        window.location.href = '/';
      } else {
        setError(data.message || 'LinkedIn profile not authorized for this app');
      }
    },
    onError: (error) => {
      setError(error.message || 'Verification failed');
    }
  });

  const handleVerify = () => {
    setError('');
    if (!linkedinUrl) {
      setError('Please enter your LinkedIn profile URL');
      return;
    }
    verifyMutation.mutate(linkedinUrl);
  };

  // If not logged in, show login prompt first
  if (!user && !userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center">
                <Linkedin className="w-10 h-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">LinkedIn Verification Required</CardTitle>
            <p className="text-center text-gray-600 mt-2">
              BSides TLV 2026 requires LinkedIn verification
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-900 mb-4">
                To verify your LinkedIn profile, please sign in first
              </p>
              <Button
                onClick={() => base44.auth.redirectToLogin(window.location.href)}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Sign In to Continue
              </Button>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600 text-center">
                After signing in, you'll verify your LinkedIn profile to access the app
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center">
              <Linkedin className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">LinkedIn Verification Required</CardTitle>
          <p className="text-center text-gray-600 mt-2">
            Please verify your LinkedIn profile to access BSides TLV 2026
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              LinkedIn Profile URL
            </label>
            <Input
              placeholder="https://www.linkedin.com/in/your-profile"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              disabled={verifyMutation.isPending}
            />
            <p className="text-xs text-gray-500">
              Enter your full LinkedIn profile URL (e.g., https://www.linkedin.com/in/username)
            </p>
          </div>

          <Button
            onClick={handleVerify}
            disabled={verifyMutation.isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {verifyMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Verify LinkedIn
              </>
            )}
          </Button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Access is limited to authorized team members only. If you're having trouble, contact the admin.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}