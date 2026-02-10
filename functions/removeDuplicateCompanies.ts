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

        // For each duplicate group, merge data and keep the most complete one
        for (const [name, group] of duplicateGroups) {
            // Sort by updated_date (most recently updated first)
            const sorted = group.sort((a, b) => 
                new Date(b.updated_date) - new Date(a.updated_date)
            );

            // Merge all data into the most complete record
            const mergedData = {};
            for (const company of sorted) {
                for (const [key, value] of Object.entries(company)) {
                    // Skip id, created_date, updated_date, created_by
                    if (['id', 'created_date', 'updated_date', 'created_by'].includes(key)) continue;
                    
                    // Only set if not already set and value exists
                    if (!mergedData[key] && value) {
                        mergedData[key] = value;
                    }
                    
                    // Special handling for arrays (like decision_makers, alumni_connections)
                    if (Array.isArray(value) && value.length > 0) {
                        if (!mergedData[key]) {
                            mergedData[key] = value;
                        } else if (Array.isArray(mergedData[key])) {
                            // Merge arrays and remove duplicates
                            mergedData[key] = [...mergedData[key], ...value];
                        }
                    }
                }
            }

            // Update the first (most recent) company with merged data
            const toKeep = sorted[0];
            await base44.asServiceRole.entities.Company.update(toKeep.id, mergedData);

            // Delete the rest
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