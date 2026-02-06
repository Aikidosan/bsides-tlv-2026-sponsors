import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone, Linkedin, ExternalLink, Calendar, Sparkles, Loader2, Users, TrendingUp, DollarSign, UserPlus, Globe, Lock } from "lucide-react";
import { format } from "date-fns";
import { base44 } from '@/api/base44Client';
import AddContactDialog from './AddContactDialog';
import { useQueryClient } from '@tanstack/react-query';

const statusColors = {
  research: "bg-gray-100 text-gray-800 border-gray-300",
  contacted: "bg-blue-100 text-blue-800 border-blue-300",
  responded: "bg-purple-100 text-purple-800 border-purple-300",
  negotiating: "bg-yellow-100 text-yellow-800 border-yellow-300",
  committed: "bg-green-100 text-green-800 border-green-300",
  closed: "bg-emerald-100 text-emerald-800 border-emerald-300",
  declined: "bg-red-100 text-red-800 border-red-300"
};

const tierColors = {
  platinum: "bg-purple-600 text-white",
  gold: "bg-yellow-500 text-white",
  silver: "bg-gray-400 text-white",
  bronze: "bg-orange-600 text-white",
  supporter: "bg-blue-500 text-white"
};

export default function CompanyCard({ company, onClick, onAIResearch }) {
  const [isResearching, setIsResearching] = useState(false);
  const [isFetchingFinancials, setIsFetchingFinancials] = useState(false);
  const [isAutoResearching, setIsAutoResearching] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const queryClient = useQueryClient();

  const handleLinkedInResearch = async (e) => {
    e.stopPropagation();
    setIsResearching(true);
    try {
      await base44.functions.invoke('linkedinResearch', { company_id: company.id });
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('LinkedIn research failed:', error);
      alert('Failed to research decision makers. Please try again.');
    } finally {
      setIsResearching(false);
    }
  };

  const handleFetchFinancials = async (e) => {
    e.stopPropagation();
    setIsFetchingFinancials(true);
    try {
      if (company.profile_type === 'public' && company.stock_symbol) {
        // Fetch public company data
        await base44.functions.invoke('fetchFinancialData', { 
          company_id: company.id, 
          stock_symbol: company.stock_symbol 
        });
      } else if (company.profile_type === 'private') {
        // Fetch private company data from Crunchbase
        await base44.functions.invoke('fetchPrivateCompanyData', { 
          company_id: company.id
        });
      } else {
        alert('Please set company type (public/private) first.');
        return;
      }
      window.location.reload();
    } catch (error) {
      console.error('Financial fetch failed:', error);
      alert('Failed to fetch financial data: ' + error.message);
    } finally {
      setIsFetchingFinancials(false);
    }
  };

  const handleAutoResearch = async (e) => {
    e.stopPropagation();
    setIsAutoResearching(true);
    try {
      await base44.functions.invoke('autoResearchCompany', { company_id: company.id });
      window.location.reload();
    } catch (error) {
      console.error('Auto research failed:', error);
      alert('Failed to auto research: ' + error.message);
    } finally {
      setIsAutoResearching(false);
    }
  };

  const handleSaveContact = async (data) => {
    setIsSavingContact(true);
    try {
      await base44.entities.Company.update(company.id, data);
      queryClient.invalidateQueries(['companies']);
      setShowAddContact(false);
    } catch (error) {
      console.error('Failed to save contact:', error);
      alert('Failed to save contact: ' + error.message);
    } finally {
      setIsSavingContact(false);
    }
  };

  return (
    <Card 
      className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-indigo-500"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-lg">{company.name}</h3>
              {company.profile_type === 'public' && (
                <Badge className="bg-blue-100 text-blue-800 text-xs flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  Public
                </Badge>
              )}
              {company.profile_type === 'private' && (
                <Badge className="bg-gray-100 text-gray-800 text-xs flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Private
                </Badge>
              )}
              {company.profile_type === 'public' && company.stock_symbol && (
                <Badge variant="outline" className="text-xs font-semibold">
                  {company.stock_symbol}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className={statusColors[company.status] + " border"}>
                {company.status.replace('_', ' ')}
              </Badge>
              {company.sponsorship_tier && (
                <Badge className={tierColors[company.sponsorship_tier]}>
                  {company.sponsorship_tier}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="text-right space-y-2">
            {company.sponsorship_amount > 0 && (
              <p className="text-2xl font-bold text-green-600">
                ${company.sponsorship_amount.toLocaleString()}
              </p>
            )}
            {(company.market_cap || company.stock_price || company.analyst_rating || company.valuation || company.funding_raised) && (
              <div className="bg-gray-50 rounded-lg p-2 space-y-1">
                {company.market_cap && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Market Cap:</span>
                    <span className="font-semibold text-gray-900">${(company.market_cap / 1000000000).toFixed(2)}B</span>
                  </div>
                )}
                {company.stock_price && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Stock Price:</span>
                    <span className="font-semibold text-gray-900">${company.stock_price.toFixed(2)}</span>
                  </div>
                )}
                {company.analyst_rating && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Rating:</span>
                    <Badge className="text-xs bg-blue-100 text-blue-800">{company.analyst_rating}</Badge>
                  </div>
                )}
                {company.valuation && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Valuation:</span>
                    <span className="font-semibold text-gray-900">${(company.valuation / 1000000).toFixed(0)}M</span>
                  </div>
                )}
                {company.funding_raised && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Funding:</span>
                    <span className="font-semibold text-gray-900">${(company.funding_raised / 1000000).toFixed(1)}M</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Key Contacts - CFO, CTO, HR, Marketing, Sales */}
         {(company.cfo_name || company.cto_name || company.hr_name || company.marketing_name || company.sales_name) && (
           <div className="space-y-2 pb-2 border-b border-gray-200">
             {company.cfo_name && (
               <div className="flex items-center justify-between text-xs">
                 <div>
                   <span className="font-semibold text-gray-700">CFO:</span>
                   <span className="ml-1 text-gray-900">{company.cfo_name}</span>
                 </div>
                 {company.cfo_email && (
                   <a 
                     href={`mailto:${company.cfo_email}`}
                     className="text-blue-600 hover:text-blue-800"
                     onClick={(e) => e.stopPropagation()}
                   >
                     <Mail className="w-3 h-3" />
                   </a>
                 )}
               </div>
             )}
             {company.cto_name && (
               <div className="flex items-center justify-between text-xs">
                 <div>
                   <span className="font-semibold text-gray-700">CTO:</span>
                   <span className="ml-1 text-gray-900">{company.cto_name}</span>
                 </div>
                 {company.cto_email && (
                   <a 
                     href={`mailto:${company.cto_email}`}
                     className="text-blue-600 hover:text-blue-800"
                     onClick={(e) => e.stopPropagation()}
                   >
                     <Mail className="w-3 h-3" />
                   </a>
                 )}
               </div>
             )}
             {company.hr_name && (
               <div className="flex items-center justify-between text-xs">
                 <div>
                   <span className="font-semibold text-gray-700">HR:</span>
                   <span className="ml-1 text-gray-900">{company.hr_name}</span>
                 </div>
                 {company.hr_email && (
                   <a 
                     href={`mailto:${company.hr_email}`}
                     className="text-blue-600 hover:text-blue-800"
                     onClick={(e) => e.stopPropagation()}
                   >
                     <Mail className="w-3 h-3" />
                   </a>
                 )}
               </div>
             )}
             {company.marketing_name && (
               <div className="flex items-center justify-between text-xs">
                 <div>
                   <span className="font-semibold text-gray-700">Marketing:</span>
                   <span className="ml-1 text-gray-900">{company.marketing_name}</span>
                 </div>
                 {company.marketing_email && (
                   <a 
                     href={`mailto:${company.marketing_email}`}
                     className="text-blue-600 hover:text-blue-800"
                     onClick={(e) => e.stopPropagation()}
                   >
                     <Mail className="w-3 h-3" />
                   </a>
                 )}
               </div>
             )}
             {company.sales_name && (
               <div className="flex items-center justify-between text-xs">
                 <div>
                   <span className="font-semibold text-gray-700">Sales:</span>
                   <span className="ml-1 text-gray-900">{company.sales_name}</span>
                 </div>
                 {company.sales_email && (
                   <a 
                     href={`mailto:${company.sales_email}`}
                     className="text-blue-600 hover:text-blue-800"
                     onClick={(e) => e.stopPropagation()}
                   >
                     <Mail className="w-3 h-3" />
                   </a>
                 )}
               </div>
             )}
           </div>
         )}

        {company.contact_name && (
          <div className="space-y-1">
            <p className="font-medium text-sm text-gray-900">{company.contact_name}</p>
            {company.contact_title && (
              <p className="text-xs text-gray-600">{company.contact_title}</p>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 text-xs">
          {company.contact_email && (
            <a 
              href={`mailto:${company.contact_email}`}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
              onClick={(e) => e.stopPropagation()}
            >
              <Mail className="w-3 h-3" />
              <span>{company.contact_email}</span>
            </a>
          )}
          {company.contact_phone && (
            <a 
              href={`tel:${company.contact_phone}`}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone className="w-3 h-3" />
              <span>{company.contact_phone}</span>
            </a>
          )}
        </div>

        {company.website && (
          <a 
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-indigo-600"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3" />
            <span className="truncate">{company.website}</span>
          </a>
        )}

        {company.next_followup_date && (
          <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
            <Calendar className="w-3 h-3" />
            <span>Follow-up: {format(new Date(company.next_followup_date), 'MMM d, yyyy')}</span>
          </div>
        )}

        {company.decision_makers && company.decision_makers.length > 0 && (
          <div className="space-y-2 mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                <Users className="w-3 h-3" />
                <span>Decision Makers</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddContact(true);
                }}
              >
                <UserPlus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
            {company.decision_makers.map((dm, idx) => (
              <div key={idx} className="text-xs space-y-0.5">
                <p className="font-medium text-gray-900">{dm.name}</p>
                <p className="text-gray-600">{dm.title}</p>
                {dm.linkedin_url ? (
                  <a
                    href={dm.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Linkedin className="w-3 h-3" />
                    <span>View Profile</span>
                  </a>
                ) : (
                  <span className="flex items-center gap-1 text-gray-400 cursor-not-allowed">
                    <Linkedin className="w-3 h-3" />
                    <span>No LinkedIn URL</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
            onClick={handleLinkedInResearch}
            disabled={isResearching}
          >
            {isResearching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Researching...
              </>
            ) : (
              <>
                <Linkedin className="w-4 h-4 mr-2" />
                Decision Makers
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
            onClick={handleAutoResearch}
            disabled={isAutoResearching}
          >
            {isAutoResearching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Researching...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Auto Research
              </>
            )}
          </Button>
        </div>

        {((company.profile_type === 'public' && company.stock_symbol && !company.market_cap) || 
          (company.profile_type === 'private' && !company.ai_research)) && (
          <Button
            size="sm"
            variant="outline"
            className="w-full mt-2 border-green-300 text-green-700 hover:bg-green-50"
            onClick={handleFetchFinancials}
            disabled={isFetchingFinancials}
          >
            {isFetchingFinancials ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Get Financial Data
              </>
            )}
          </Button>
        )}
      </CardContent>

      {showAddContact && (
        <AddContactDialog
          company={company}
          onClose={() => setShowAddContact(false)}
          onSave={handleSaveContact}
          isSaving={isSavingContact}
        />
      )}
    </Card>
  );
}