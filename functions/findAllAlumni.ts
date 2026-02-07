import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Team LinkedIn profiles to check
        const teamProfiles = [
            { name: 'Guy Desau', url: 'https://www.linkedin.com/in/guy-desau/' },
            { name: 'Keren Lerner', url: 'https://www.linkedin.com/in/kerenlerner/' },
            { name: 'Avital Aviv', url: 'https://www.linkedin.com/in/avital-aviv-a778b01b2/' },
            { name: 'Ariel Mitiushkin', url: 'https://www.linkedin.com/in/ariel-mitiushkin' }
        ];

        // Get all companies
        const companies = await base44.asServiceRole.entities.Company.list();

        let totalConnectionsFound = 0;
        let companiesUpdated = 0;

        // For each team member, fetch their LinkedIn profile and extract work history
        for (const teamMember of teamProfiles) {
            try {
                // Use AI to extract work history from LinkedIn profile
                const profileData = await base44.integrations.Core.InvokeLLM({
                    prompt: `Extract the work history from this LinkedIn profile: ${teamMember.url}
                    
                    Return a JSON array of companies this person has worked at, including:
                    - company_name (exact company name)
                    - role (job title)
                    - duration (time period)
                    
                    Only include actual employment, not education or volunteer work.`,
                    add_context_from_internet: true,
                    response_json_schema: {
                        type: 'object',
                        properties: {
                            companies: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        company_name: { type: 'string' },
                                        role: { type: 'string' },
                                        duration: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                });

                const workHistory = profileData.companies || [];

                // Match work history against sponsor companies
                for (const company of companies) {
                    const matchingWork = workHistory.find(work => 
                        work.company_name.toLowerCase().includes(company.name.toLowerCase()) ||
                        company.name.toLowerCase().includes(work.company_name.toLowerCase())
                    );

                    if (matchingWork) {
                        // Get existing alumni connections or create new array
                        const existingConnections = company.alumni_connections || [];
                        
                        // Check if this connection already exists
                        const alreadyExists = existingConnections.some(
                            conn => conn.team_member_name === teamMember.name
                        );

                        if (!alreadyExists) {
                            existingConnections.push({
                                team_member_name: teamMember.name,
                                team_member_email: '', // Email not available from LinkedIn
                                connection_type: `Former ${matchingWork.role}`,
                                notes: `Worked at ${matchingWork.company_name} (${matchingWork.duration}). LinkedIn: ${teamMember.url}`
                            });

                            // Update company with new connection
                            await base44.asServiceRole.entities.Company.update(company.id, {
                                alumni_connections: existingConnections
                            });

                            totalConnectionsFound++;
                            companiesUpdated++;
                        }
                    }
                }

                // Add small delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.error(`Failed to process ${teamMember.name}:`, error);
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