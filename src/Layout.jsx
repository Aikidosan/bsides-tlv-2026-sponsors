import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import TimeTracker from './components/TimeTracker';

export default function Layout({ children, currentPageName }) {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

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