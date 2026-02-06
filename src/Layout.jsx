export default function Layout({ children, currentPageName }) {
  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed" 
      style={{backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6984dc825e7d995631e3cbc6/3b7a27f55_hf_20260206_223755_110d6f73-a0bc-4eee-8233-bd223d17a8a6.png)'}}
    >
      {children}
    </div>
  );
}