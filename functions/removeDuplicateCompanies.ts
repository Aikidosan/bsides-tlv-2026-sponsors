import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Get all companies
        const companies = await base44.asServiceRole.entities.Company.list();

        // Group by normalized name
        const companyGroups = {};
        for (const company of companies) {
            const normalizedName = company.name.toLowerCase().trim();
            if (!companyGroups[normalizedName]) {
                companyGroups[normalizedName] = [];
            }
            companyGroups[normalizedName].push(company);
        }

        // Find duplicates (groups with more than 1 company)
        const duplicateGroups = Object.entries(companyGroups).filter(([_, group]) => group.length > 1);

        let removedCount = 0;
        const removedCompanies = [];

        // For each duplicate group, keep the newest one and delete the rest
        for (const [name, group] of duplicateGroups) {
            // Sort by created_date (newest first)
            const sorted = group.sort((a, b) => 
                new Date(b.created_date) - new Date(a.created_date)
            );

            // Keep the first (newest), delete the rest
            const toKeep = sorted[0];
            const toRemove = sorted.slice(1);

            for (const company of toRemove) {
                await base44.asServiceRole.entities.Company.delete(company.id);
                removedCount++;
                removedCompanies.push({
                    id: company.id,
                    name: company.name,
                    created_date: company.created_date
                });
            }
        }

        return Response.json({
            success: true,
            removed_count: removedCount,
            duplicate_groups_found: duplicateGroups.length,
            removed_companies: removedCompanies,
            message: `Removed ${removedCount} duplicate companies from ${duplicateGroups.length} groups`
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});