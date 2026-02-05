import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone, Linkedin, ExternalLink, Calendar, Sparkles } from "lucide-react";
import { format } from "date-fns";

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
          
          {company.sponsorship_amount > 0 && (
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                ${company.sponsorship_amount.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
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

        {!company.ai_research && onAIResearch && (
          <Button
            size="sm"
            variant="outline"
            className="w-full mt-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
            onClick={(e) => {
              e.stopPropagation();
              onAIResearch(company);
            }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Get AI Research
          </Button>
        )}
      </CardContent>
    </Card>
  );
}