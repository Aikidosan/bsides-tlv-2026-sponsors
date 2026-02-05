import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, ArrowLeft, Linkedin, Loader2, ArrowUpDown, Map } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CompanyCard from '../components/sponsors/CompanyCard';
import CompanyDialog from '../components/sponsors/CompanyDialog';

export default function Sponsors() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isBulkResearching, setIsBulkResearching] = useState(false);
  const [isBulkFetchingFinancials, setIsBulkFetchingFinancials] = useState(false);
  const [sortBy, setSortBy] = useState('updated');
  const [viewMode, setViewMode] = useState('grid');
  const queryClient = useQueryClient();

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

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Company.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['companies']);
      setShowDialog(false);
      setSelectedCompany(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Company.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['companies']);
      setShowDialog(false);
      setSelectedCompany(null);
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

  const handleBulkLinkedInResearch = async () => {
    setIsBulkResearching(true);
    try {
      const response = await base44.functions.invoke('bulkLinkedinResearch', {});
      alert(`Research complete! Processed ${response.data.processed} companies, ${response.data.failed} failed.`);
      queryClient.invalidateQueries(['companies']);
    } catch (error) {
      alert('Bulk research failed: ' + error.message);
    } finally {
      setIsBulkResearching(false);
    }
  };

  const handleBulkFetchFinancials = async () => {
    const companiesWithSymbols = companies?.filter(c => c.stock_symbol) || [];
    if (companiesWithSymbols.length === 0) {
      alert('No companies have stock symbols set. Add stock symbols first.');
      return;
    }
    
    setIsBulkFetchingFinancials(true);
    let processed = 0;
    let failed = 0;

    try {
      for (const company of companiesWithSymbols) {
        try {
          await base44.functions.invoke('fetchFinancialData', { 
            company_id: company.id, 
            stock_symbol: company.stock_symbol 
          });
          processed++;
        } catch (err) {
          console.error(`Failed for ${company.name}:`, err);
          failed++;
        }
        // Small delay to avoid rate limiting
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">Sponsor Pipeline</h1>
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {filteredAndSortedCompanies.length} {filteredAndSortedCompanies.length === 1 ? 'company' : 'companies'}
                </span>
              </div>
              <p className="text-gray-600">Track outreach to Israeli cybersecurity companies</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleBulkLinkedInResearch}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
              disabled={isBulkResearching}
            >
              {isBulkResearching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Linkedin className="w-4 h-4 mr-2" />
                  Find All Decision Makers
                </>
              )}
            </Button>
            <Button 
              onClick={handleBulkFetchFinancials}
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50"
              disabled={isBulkFetchingFinancials}
            >
              {isBulkFetchingFinancials ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  Fetch All Financial Data
                </>
              )}
            </Button>
            <Button 
              onClick={handleBulkImportIsraeli}
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Import Israeli Companies
            </Button>
            <Button 
              onClick={() => {
                setSelectedCompany(null);
                setShowDialog(true);
              }}
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
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Sort by:</span>
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
                <Map className="w-4 h-4 mr-2" />
                Map
              </Button>
            </div>
          </div>
        </div>

        {/* Companies View */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : filteredAndSortedCompanies.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedCompanies.map(company => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  onClick={() => {
                    setSelectedCompany(company);
                    setShowDialog(true);
                  }}
                />
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