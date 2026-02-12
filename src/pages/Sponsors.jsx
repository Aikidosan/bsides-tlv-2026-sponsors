import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { logActivity } from '../components/ActivityLogger';
import { Plus, Search, ArrowLeft, Linkedin, Loader2, ArrowUpDown, Map, Sparkles, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CompanyCard from '../components/sponsors/CompanyCard';
import CompanyDialog from '../components/sponsors/CompanyDialog';
import PastSponsorsBar from '../components/sponsors/PastSponsorsBar';

export default function Sponsors() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isBulkResearching, setIsBulkResearching] = useState(false);
  const [isBulkFetchingFinancials, setIsBulkFetchingFinancials] = useState(false);
  const [isBulkDecisionMakers, setIsBulkDecisionMakers] = useState(false);
  const [sortBy, setSortBy] = useState('updated');
  const [viewMode, setViewMode] = useState('grid');
  const [highlightedCompanyId, setHighlightedCompanyId] = useState(null);
  const queryClient = useQueryClient();
  const companyRefs = React.useRef({});

  // Handle URL parameters for status filter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const statusParam = urlParams.get('status');
    if (statusParam) {
      setFilterStatus(statusParam);
    }
  }, []);

  const { data: companies, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => base44.entities.Company.list('-updated_date'),
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Company.create(data),
    onSuccess: (newCompany) => {
      queryClient.invalidateQueries(['companies']);
      setShowDialog(false);
      setSelectedCompany(null);
      logActivity({
        action: 'created_company',
        entity_type: 'Company',
        entity_id: newCompany.id,
        entity_name: newCompany.name,
        details: `Added new company to sponsor pipeline`,
        user
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Company.update(id, data),
    onSuccess: (updatedCompany) => {
      queryClient.invalidateQueries(['companies']);
      setShowDialog(false);
      setSelectedCompany(null);
      logActivity({
        action: 'updated_company',
        entity_type: 'Company',
        entity_id: updatedCompany.id,
        entity_name: updatedCompany.name,
        details: `Updated company information`,
        user
      });
    },
  });

  const filteredAndSortedCompanies = companies?.filter(c => {
    const matchesSearch = !searchTerm || 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contact_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Handle multiple statuses (e.g., "contacted,responded")
    const statusList = filterStatus.split(',');
    const matchesStatus = filterStatus === 'all' || statusList.includes(c.status);
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'size':
        // Sort by market cap if available, otherwise fall back to size enum
        if (a.market_cap && b.market_cap) {
          return b.market_cap - a.market_cap;
        } else if (a.market_cap) {
          return -1;
        } else if (b.market_cap) {
          return 1;
        } else {
          const sizeOrder = { enterprise: 5, large: 4, medium: 3, small: 2, startup: 1 };
          return (sizeOrder[b.size] || 0) - (sizeOrder[a.size] || 0);
        }
      case 'trending':
        return new Date(b.updated_date) - new Date(a.updated_date);
      case 'alphabet':
        return a.name.localeCompare(b.name);
      case 'ai':
        const aIsAI = a.industry?.toLowerCase().includes('ai') || a.name.toLowerCase().includes('ai');
        const bIsAI = b.industry?.toLowerCase().includes('ai') || b.name.toLowerCase().includes('ai');
        return (bIsAI ? 1 : 0) - (aIsAI ? 1 : 0);
      default:
        return new Date(b.updated_date) - new Date(a.updated_date);
    }
  }) || [];

  const handleSave = (data) => {
    if (selectedCompany) {
      updateMutation.mutate({ id: selectedCompany.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleBulkAutoResearch = async () => {
    setIsBulkResearching(true);
    let processed = 0;
    let failed = 0;
    
    try {
      for (const company of companies || []) {
        try {
          await base44.functions.invoke('autoResearchCompany', { 
            company_id: company.id
          });
          processed++;
        } catch (err) {
          console.error(`Failed for ${company.name}:`, err);
          failed++;
        }
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      alert(`Auto research complete! Processed ${processed} companies, ${failed} failed.`);
      queryClient.invalidateQueries(['companies']);
    } catch (error) {
      alert('Bulk research failed: ' + error.message);
    } finally {
      setIsBulkResearching(false);
    }
  };

  const handleBulkFetchFinancials = async () => {
    const eligibleCompanies = companies?.filter(c => 
      (c.profile_type === 'public' && c.stock_symbol) || c.profile_type === 'private'
    ) || [];
    
    if (eligibleCompanies.length === 0) {
      alert('No companies are eligible. Set company types (public/private) and stock symbols for public companies first.');
      return;
    }
    
    setIsBulkFetchingFinancials(true);
    let processed = 0;
    let failed = 0;

    try {
      for (const company of eligibleCompanies) {
        try {
          if (company.profile_type === 'public' && company.stock_symbol) {
            await base44.functions.invoke('fetchFinancialData', { 
              company_id: company.id, 
              stock_symbol: company.stock_symbol 
            });
          } else if (company.profile_type === 'private') {
            await base44.functions.invoke('fetchPrivateCompanyData', { 
              company_id: company.id
            });
          }
          processed++;
        } catch (err) {
          console.error(`Failed for ${company.name}:`, err);
          failed++;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      alert(`Financial data fetch complete! Processed ${processed} companies, ${failed} failed.`);
      queryClient.invalidateQueries(['companies']);
    } catch (error) {
      alert('Bulk financial fetch failed: ' + error.message);
    } finally {
      setIsBulkFetchingFinancials(false);
    }
  };

  const handleBulkDecisionMakers = async () => {
    setIsBulkDecisionMakers(true);
    let processed = 0;
    let failed = 0;
    
    try {
      for (const company of companies || []) {
        try {
          await base44.functions.invoke('linkedinResearch', { 
            company_id: company.id
          });
          processed++;
        } catch (err) {
          console.error(`Failed for ${company.name}:`, err);
          failed++;
        }
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      alert(`Decision makers research complete! Processed ${processed} companies, ${failed} failed.`);
      queryClient.invalidateQueries(['companies']);
    } catch (error) {
      alert('Bulk decision makers research failed: ' + error.message);
    } finally {
      setIsBulkDecisionMakers(false);
    }
  };

  const handleBulkImportIsraeli = async () => {
    if (!window.confirm('This will import 75+ Israeli cybersecurity companies. Continue?')) {
      return;
    }
    
    try {
      const response = await base44.functions.invoke('bulkImportIsraeliCybersecurity', {});
      alert(`Import successful! Added ${response.data.count} companies to the pipeline.`);
      queryClient.invalidateQueries(['companies']);
    } catch (error) {
      alert('Import failed: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-3 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="ghost" size="icon" className="shrink-0 bg-white/80 backdrop-blur-sm hover:bg-white/90 w-12 h-12">
                <ArrowLeft className="w-7 h-7 font-bold" strokeWidth={3} />
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg inline-block">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-4xl md:text-5xl font-bold text-black">Sponsor Pipeline</h1>
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-full text-lg md:text-xl font-semibold whitespace-nowrap">
                    {filteredAndSortedCompanies.length} {filteredAndSortedCompanies.length === 1 ? 'company' : 'companies'}
                  </span>
                </div>
                <p className="text-black text-base md:text-lg font-bold hidden md:block">Track outreach to Israeli cybersecurity companies</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={async () => {
                try {
                  const response = await base44.functions.invoke('findAllAlumni', {});
                  alert(response.data.message);
                  queryClient.invalidateQueries(['companies']);
                } catch (error) {
                  alert('Failed to find alumni connections: ' + error.message);
                }
              }}
              variant="outline"
              size="sm"
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <GraduationCap className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Find All Alumni</span>
            </Button>
            <Button 
              onClick={handleBulkDecisionMakers}
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
              disabled={isBulkDecisionMakers}
            >
              {isBulkDecisionMakers ? (
                <>
                  <Loader2 className="w-4 h-4 md:mr-2 animate-spin" />
                  <span className="hidden md:inline">Researching...</span>
                </>
              ) : (
                <>
                  <Linkedin className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Decision Makers All</span>
                </>
              )}
            </Button>
            <Button 
              onClick={handleBulkAutoResearch}
              variant="outline"
              size="sm"
              className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              disabled={isBulkResearching}
            >
              {isBulkResearching ? (
                <>
                  <Loader2 className="w-4 h-4 md:mr-2 animate-spin" />
                  <span className="hidden md:inline">Researching...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Auto Research All</span>
                </>
              )}
            </Button>
            <Button 
              onClick={handleBulkFetchFinancials}
              variant="outline"
              size="sm"
              className="border-green-300 text-green-700 hover:bg-green-50"
              disabled={isBulkFetchingFinancials}
            >
              {isBulkFetchingFinancials ? (
                <>
                  <Loader2 className="w-4 h-4 md:mr-2 animate-spin" />
                  <span className="hidden md:inline">Fetching...</span>
                </>
              ) : (
                <>
                  <ArrowUpDown className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Fetch All Financial Data</span>
                </>
              )}
            </Button>
            <Button 
              onClick={handleBulkImportIsraeli}
              variant="outline"
              size="sm"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Plus className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Import Israeli Companies</span>
            </Button>
            <Button 
              onClick={async () => {
                if (confirm('Remove all duplicate companies? This will keep the newest version of each.')) {
                  try {
                    const response = await base44.functions.invoke('removeDuplicateCompanies', {});
                    alert(response.data.message);
                    queryClient.invalidateQueries(['companies']);
                  } catch (error) {
                    alert('Failed to remove duplicates: ' + error.message);
                  }
                }
              }}
              variant="outline"
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <Plus className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Remove Duplicates</span>
            </Button>
            <Button 
              onClick={() => {
                setSelectedCompany(null);
                setShowDialog(true);
              }}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search companies or contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'research', 'contacted', 'negotiating', 'committed', 'closed'].map(status => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className="whitespace-nowrap"
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Sort and View Controls */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
              <ArrowUpDown className="w-4 h-4 text-gray-500 shrink-0" />
              <span className="text-sm text-gray-600 shrink-0">Sort by:</span>
              <div className="flex gap-2">
                {[
                  { value: 'size', label: 'Biggest First' },
                  { value: 'trending', label: 'Trending' },
                  { value: 'alphabet', label: 'A-Z' },
                  { value: 'ai', label: 'AI Leaders' }
                ].map(option => (
                  <Button
                    key={option.value}
                    variant={sortBy === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy(option.value)}
                    className="whitespace-nowrap"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <Map className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Map</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Past Sponsors Bar */}
        <PastSponsorsBar 
          companies={companies}
          onCompanyClick={(company) => {
            // Clear search to ensure company is visible
            setSearchTerm('');
            // Scroll to the company card
            setTimeout(() => {
              const element = companyRefs.current[company.id];
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setHighlightedCompanyId(company.id);
                setTimeout(() => setHighlightedCompanyId(null), 2000);
              }
            }, 100);
          }}
        />

        {/* Companies View */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : filteredAndSortedCompanies.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedCompanies.map(company => (
                <div
                  key={company.id}
                  ref={(el) => companyRefs.current[company.id] = el}
                  className={`transition-all duration-500 ${
                    highlightedCompanyId === company.id ? 'ring-4 ring-indigo-500 rounded-xl' : ''
                  }`}
                >
                  <CompanyCard
                    company={company}
                    onClick={() => {
                      setSelectedCompany(company);
                      setShowDialog(true);
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="text-center py-12">
                <Map className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">Map View Coming Soon</p>
                <p className="text-gray-500">Visualize sponsor locations across Israel</p>
              </div>
            </div>
          )
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">No companies found. Add your first prospect!</p>
          </div>
        )}

        {/* Company Dialog */}
        {showDialog && (
          <CompanyDialog
            company={selectedCompany}
            onClose={() => {
              setShowDialog(false);
              setSelectedCompany(null);
            }}
            onSave={handleSave}
            isSaving={createMutation.isPending || updateMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}