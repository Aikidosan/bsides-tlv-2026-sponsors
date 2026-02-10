import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Well-known public companies with their stock symbols
        const publicCompanies = {
            'intel': 'INTC',
            'palo alto networks': 'PANW',
            'check point': 'CHKP',
            'fortinet': 'FTNT',
            'cybereason': 'CYBR',
            'wix': 'WIX',
            'appsflyer': 'APPS',
            'moonactive': 'MOON',
            'general electric': 'GE',
            'sompo': 'SMPOF'
        };

        const companies = await base44.asServiceRole.entities.Company.filter({});
        let updatedCount = 0;
        const updatedCompanies = [];
        const updatePromises = [];

        for (const company of companies) {
            const normalizedName = company.name.toLowerCase().trim();
            
            // Check if company name contains any of the public company names
            for (const [publicName, stockSymbol] of Object.entries(publicCompanies)) {
                if (normalizedName.includes(publicName) && company.profile_type !== 'public') {
                    updatePromises.push(
                        base44.asServiceRole.entities.Company.update(company.id, {
                            profile_type: 'public',
                            stock_symbol: stockSymbol
                        }).then(() => {
                            updatedCompanies.push({
                                name: company.name,
                                stock_symbol: stockSymbol
                            });
                        })
                    );
                    updatedCount++;
                    break;
                }
            }
        }

        // Execute all updates in parallel
        await Promise.all(updatePromises);

        return Response.json({
            success: true,
            updated_count: updatedCount,
            updated_companies: updatedCompanies,
            message: `Updated ${updatedCount} companies to public with stock symbols`
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});