import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const pastSponsorsData = {
  "2024": [
    "Palo Alto Networks", "Porsche Digital", "Sygnia", "Oasis Security", "SANS"
  ],
  "2023": [
    "Legit", "Sompo", "Moonactive", "Rescana", "Shabak", "Sikreta", "Descope", "SANS"
  ],
  "2021": [
    "Cider Security", "General Electric", "Mitiga", "Palo Alto Networks", "Wix",
    "AppsFlyer", "Bank Poalim", "Check Point", "Fortinet", "Moonactive",
    "Security Joes", "Shabak", "Sompo", "Cybereason", "Cymotive", "Intel"
  ],
  "2020": [
    "AppsFlyer", "Intel", "Neuralegion", "Check Point", "Clear Sky", "HackerOne", "Cybereason"
  ]
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all companies
        const companies = await base44.asServiceRole.entities.Company.list();
        
        let updated = 0;
        const updatedCompanies = [];

        // For each company, check if it matches any past sponsor
        for (const company of companies) {
            const companyNameLower = company.name.toLowerCase().trim();
            const matchedYears = [];

            // Check each year
            for (const [year, sponsors] of Object.entries(pastSponsorsData)) {
                for (const sponsor of sponsors) {
                    const sponsorLower = sponsor.toLowerCase().trim();
                    
                    // Match if company name contains sponsor or vice versa
                    if (companyNameLower.includes(sponsorLower) || sponsorLower.includes(companyNameLower)) {
                        if (!matchedYears.includes(year)) {
                            matchedYears.push(year);
                        }
                    }
                }
            }

            // Update company if we found matches
            if (matchedYears.length > 0) {
                await base44.asServiceRole.entities.Company.update(company.id, {
                    past_sponsor_years: matchedYears.sort().reverse() // Most recent first
                });
                updated++;
                updatedCompanies.push({ name: company.name, years: matchedYears });
            }
        }

        return Response.json({
            success: true,
            updated_count: updated,
            total_companies: companies.length,
            updated_companies: updatedCompanies
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});