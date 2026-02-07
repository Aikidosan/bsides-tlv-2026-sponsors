import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all companies and users
        const companies = await base44.entities.Company.list();
        const users = await base44.entities.User.list();

        let totalConnectionsFound = 0;
        let companiesUpdated = 0;

        // For each company, check if any team member has a connection
        for (const company of companies) {
            const alumniConnections = [];

            // Check each user's potential connection to this company
            for (const teamMember of users) {
                // Simple example: Check if user's email domain matches company domain
                // In a real implementation, this would use LinkedIn API or other data sources
                
                // Check if team member has the company name in their profile/background
                // This is a placeholder - you would integrate with LinkedIn or other sources
                const connection = checkAlumniConnection(teamMember, company);
                
                if (connection) {
                    alumniConnections.push({
                        team_member_name: teamMember.full_name,
                        team_member_email: teamMember.email,
                        connection_type: connection.type,
                        notes: connection.notes
                    });
                    totalConnectionsFound++;
                }
            }

            // Update company if connections found
            if (alumniConnections.length > 0) {
                await base44.asServiceRole.entities.Company.update(company.id, {
                    alumni_connections: alumniConnections
                });
                companiesUpdated++;
            }
        }

        return Response.json({
            success: true,
            companies_updated: companiesUpdated,
            total_connections_found: totalConnectionsFound,
            message: `Found ${totalConnectionsFound} alumni connections across ${companiesUpdated} companies`
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

// Helper function to check alumni connections
// This is a placeholder - integrate with LinkedIn API or other data sources
function checkAlumniConnection(teamMember, company) {
    // Example logic - you would implement actual LinkedIn/database checks here
    // For now, this is a demo that checks if company name appears in user's background
    
    // Placeholder: Check if email domain matches (just as an example)
    const userDomain = teamMember.email?.split('@')[1]?.toLowerCase();
    const companyDomain = company.website?.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].toLowerCase();
    
    if (userDomain && companyDomain && companyDomain.includes(userDomain.split('.')[0])) {
        return {
            type: 'Email domain match',
            notes: 'Potential connection based on email domain'
        };
    }
    
    // Additional checks would go here:
    // - LinkedIn API integration to check past employment
    // - Educational background matching
    // - Network connections
    // - Manual tags or notes
    
    return null;
}