import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';

const pastSponsorsData = {
  "2024": [
    { name: "Palo Alto Networks", tier: "gold" },
    { name: "Porsche Digital", tier: "gold" },
    { name: "Sygnia", tier: "gold" },
    { name: "Oasis Security", tier: "silver" },
    { name: "SANS", tier: "bronze" }
  ],
  "2023": [
    { name: "Legit", tier: "platinum" },
    { name: "Sompo", tier: "gold" },
    { name: "Moonactive", tier: "silver" },
    { name: "Rescana", tier: "silver" },
    { name: "Shabak", tier: "silver" },
    { name: "Sikreta", tier: "silver" },
    { name: "Descope", tier: "bronze" },
    { name: "SANS", tier: "bronze" }
  ],
  "2021": [
    { name: "Cider Security", tier: "platinum" },
    { name: "General Electric", tier: "platinum" },
    { name: "Mitiga", tier: "platinum" },
    { name: "Palo Alto Networks", tier: "platinum" },
    { name: "Wix", tier: "platinum" },
    { name: "AppsFlyer", tier: "gold" },
    { name: "Bank Poalim", tier: "gold" },
    { name: "Check Point", tier: "gold" },
    { name: "Fortinet", tier: "gold" },
    { name: "Moonactive", tier: "gold" },
    { name: "Security Joes", tier: "gold" },
    { name: "Shabak", tier: "gold" },
    { name: "Sompo", tier: "gold" },
    { name: "Cybereason", tier: "silver" },
    { name: "Cymotive", tier: "silver" },
    { name: "Intel", tier: "silver" }
  ],
  "2020": [
    { name: "AppsFlyer", tier: "titanium" },
    { name: "Intel", tier: "platinum" },
    { name: "Neuralegion", tier: "gold" },
    { name: "Check Point", tier: "gold" },
    { name: "Clear Sky", tier: "gold" },
    { name: "HackerOne", tier: "gold" },
    { name: "Cybereason", tier: "gold" }
  ]
};

const yearColors = {
  "2024": "bg-rose-500 hover:bg-rose-600",
  "2023": "bg-violet-500 hover:bg-violet-600",
  "2021": "bg-emerald-500 hover:bg-emerald-600",
  "2020": "bg-amber-500 hover:bg-amber-600"
};

export default function PastSponsorsBar({ companies, onCompanyClick }) {
  return (
    <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl shadow-sm p-4 border border-indigo-200">
      <div className="flex items-center gap-3 mb-3">
        <Building2 className="w-5 h-5 text-indigo-600" />
        <h3 className="font-bold text-lg text-gray-900">Past BSidesTLV Sponsors</h3>
      </div>
      <div className="space-y-3">
        {Object.entries(pastSponsorsData).map(([year, sponsors]) => (
          <div key={year} className="flex flex-col md:flex-row gap-2">
            <div className={`${yearColors[year]} text-white px-3 py-1.5 rounded-lg font-bold text-sm shrink-0 self-start`}>
              {year}
            </div>
            <div className="flex flex-wrap gap-2 flex-1">
              {sponsors.map((sponsor, idx) => {
                const company = companies?.find(c => 
                  c.name.toLowerCase().includes(sponsor.name.toLowerCase()) || 
                  sponsor.name.toLowerCase().includes(c.name.toLowerCase())
                );
                
                return (
                  <Badge
                    key={idx}
                    variant="outline"
                    className={`bg-white/80 backdrop-blur-sm border-gray-300 text-gray-700 transition-colors ${
                      company ? 'cursor-pointer hover:bg-indigo-50 hover:border-indigo-400' : 'hover:bg-white'
                    }`}
                    onClick={() => company && onCompanyClick(company)}
                  >
                    {sponsor.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}