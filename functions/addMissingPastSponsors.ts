import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all existing companies
        const companies = await base44.asServiceRole.entities.Company.list();
        const existingNames = companies.map(c => c.name.toLowerCase());

        // Collect all unique sponsors
        const allSponsors = new Map();
        for (const [year, sponsors] of Object.entries(pastSponsorsData)) {
            for (const sponsor of sponsors) {
                if (!allSponsors.has(sponsor.name)) {
                    allSponsors.set(sponsor.name, {
                        name: sponsor.name,
                        years: [year],
                        tiers: { [year]: sponsor.tier }
                    });
                } else {
                    const existing = allSponsors.get(sponsor.name);
                    existing.years.push(year);
                    existing.tiers[year] = sponsor.tier;
                }
            }
        }

        // Find missing companies
        const missingSponsors = [];
        for (const [name, data] of allSponsors.entries()) {
            const exists = existingNames.some(existing => 
                existing.includes(name.toLowerCase()) || name.toLowerCase().includes(existing)
            );
            if (!exists) {
                missingSponsors.push({
                    name: data.name,
                    status: 'research',
                    industry: 'cybersecurity',
                    past_sponsor_years: data.years,
                    notes: `Past BSidesTLV sponsor: ${data.years.join(', ')}`
                });
            }
        }

        // Create missing companies
        if (missingSponsors.length > 0) {
            await base44.asServiceRole.entities.Company.bulkCreate(missingSponsors);
        }

        return Response.json({
            success: true,
            added_count: missingSponsors.length,
            companies: missingSponsors.map(s => s.name)
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});