import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import TimeTracker from './components/TimeTracker';
import { useEffect } from 'react';

export default function Layout({ children, currentPageName }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const userData = await base44.auth.me();
        return userData;
      } catch (error) {
        // User not authenticated - redirect to login
        if (currentPageName !== 'LinkedInVerification') {
          base44.auth.redirectToLogin(window.location.pathname);
        }
        return null;
      }
    },
    retry: 1,
    staleTime: 0
  });

  // Redirect to verification if user is not verified
  useEffect(() => {
    if (!isLoading && user && currentPageName !== 'LinkedInVerification') {
      // Strict check: if linkedin_verified is not explicitly true, redirect
      const isVerified = user.data?.linkedin_verified === true || user.data?.data?.linkedin_verified === true;
      if (!isVerified) {
        window.location.href = '/LinkedInVerification';
      }
    }
  }, [user, isLoading, currentPageName]);

  // Show loading or verification check
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // If no user and not on verification page, show loading (will redirect)
  if (!user && currentPageName !== 'LinkedInVerification') {
    return <div className="min-h-screen flex items-center justify-center">Redirecting to login...</div>;
  }

  // Strict verification check: only allow access if linkedin_verified is explicitly true
  const isVerified = user?.data?.linkedin_verified === true || user?.data?.data?.linkedin_verified === true;
  if (user && !isVerified && currentPageName !== 'LinkedInVerification') {
    return <div className="min-h-screen flex items-center justify-center">Redirecting to verification...</div>;
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed" 
      style={{backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6984dc825e7d995631e3cbc6/3b7a27f55_hf_20260206_223755_110d6f73-a0bc-4eee-8233-bd223d17a8a6.png)'}}
    >
      <TimeTracker user={user} currentPageName={currentPageName} />
      {children}
    </div>
  );
}