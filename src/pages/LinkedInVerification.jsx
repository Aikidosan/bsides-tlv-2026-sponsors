import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Linkedin, AlertCircle, Loader2 } from 'lucide-react';

export default function LinkedInVerification() {
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
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

  const verifyLinkedInMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('linkedinOAuthCallback', {});
      return response.data;
    },
    onSuccess: (data) => {
      if (data.verified) {
        queryClient.invalidateQueries(['user']);
        window.location.href = '/';
      } else {
        setError(data.message || 'LinkedIn profile not authorized for this app');
        setVerifying(false);
      }
    },
    onError: (error) => {
      setError(error.response?.data?.message || error.message || 'Verification failed');
      setVerifying(false);
    }
  });

  // Check if user just came back from LinkedIn OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('linkedin_connected') === 'true' && user) {
      setVerifying(true);
      verifyLinkedInMutation.mutate();
    }
  }, [user]);

  const handleLinkedInLogin = async () => {
    if (!user) {
      // First sign in to the app
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    
    // Redirect to LinkedIn OAuth
    const currentUrl = window.location.origin + window.location.pathname;
    const callbackUrl = `${currentUrl}?linkedin_connected=true`;
    window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=openid%20profile%20email`;
  };

  if (userLoading || verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          {verifying && <p className="text-gray-600">Verifying your LinkedIn profile...</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 bg-[#0A66C2] rounded-full flex items-center justify-center shadow-lg">
              <Linkedin className="w-12 h-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">LinkedIn Verification Required</CardTitle>
          <p className="text-center text-gray-600 mt-2">
            Sign in with LinkedIn to access BSides TLV 2026
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <Button
            onClick={handleLinkedInLogin}
            className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white h-12 text-base font-semibold"
          >
            <Linkedin className="w-5 h-5 mr-2" />
            Sign in with LinkedIn
          </Button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-xs text-blue-800 text-center">
              <strong>Access is limited to authorized team members.</strong>
              <br />
              You'll be redirected to LinkedIn to verify your identity.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}