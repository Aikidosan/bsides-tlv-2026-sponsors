import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Linkedin, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

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

  const linkedinAuthMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('linkedinAuth', {});
      return response.data;
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
      setError(error.message || 'Authentication failed');
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async (url) => {
      try {
        const response = await base44.functions.invoke('verifyLinkedIn', { linkedin_url: url });
        return response.data;
      } catch (error) {
        if (error.response?.data) {
          throw new Error(error.response.data.message || 'Verification failed');
        }
        throw error;
      }
    },
    onSuccess: async (data) => {
      if (data.verified) {
        await queryClient.invalidateQueries(['user']);
        await queryClient.refetchQueries(['user']);
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
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

          <Button
            onClick={() => linkedinAuthMutation.mutate()}
            disabled={linkedinAuthMutation.isPending}
            className="w-full bg-[#0A66C2] hover:bg-[#004182]"
          >
            {linkedinAuthMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Linkedin className="w-5 h-5 mr-2" />
                Continue with LinkedIn
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or verify manually</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              LinkedIn Profile URL
            </label>
            <Input
              placeholder="https://www.linkedin.com/in/your-profile"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              disabled={verifyMutation.isPending || linkedinAuthMutation.isPending}
            />
            <p className="text-xs text-gray-500">
              Enter your full LinkedIn profile URL (e.g., https://www.linkedin.com/in/username)
            </p>
          </div>

          <Button
            onClick={handleVerify}
            disabled={verifyMutation.isPending || linkedinAuthMutation.isPending}
            variant="outline"
            className="w-full"
          >
            {verifyMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Verify Manually
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