import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, ArrowLeft, Linkedin, Loader2 } from 'lucide-react';
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

  const filteredCompanies = companies?.filter(c => {
    const matchesSearch = !searchTerm || 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contact_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Handle multiple statuses (e.g., "contacted,responded")
    const statusList = filterStatus.split(',');
    const matchesStatus = filterStatus === 'all' || statusList.includes(c.status);
    
    return matchesSearch && matchesStatus;
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
              <h1 className="text-3xl font-bold">Sponsor Pipeline</h1>
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
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
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
        </div>

        {/* Companies Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.map(company => (
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