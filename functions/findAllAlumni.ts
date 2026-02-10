import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Team members to check
        const teamMembers = [
            { name: 'Guy Desau', email: 'guy@example.com' },
            { name: 'Keren Lerner', email: 'keren.tld@gmail.com' },
            { name: 'Avital Aviv', email: 'avitalos6@gmail.com' },
            { name: 'Ariel Mitiushkin', email: 'a.mitiushkin@gmail.com' },
            { name: 'Reut Menashe', email: 'Reut@bsidestlv.com' },
            { name: 'Gil Yankovitch', email: 'gil@bsidestlv.com' }
        ];

        // Get all companies
        const companies = await base44.asServiceRole.entities.Company.list();
        
        // Get LinkedIn access token
        const accessToken = await base44.asServiceRole.connectors.getAccessToken('linkedin');

        let totalConnectionsFound = 0;
        let companiesUpdated = 0;

        // Fetch LinkedIn connections
        const connectionsResponse = await fetch('https://api.linkedin.com/v2/connections?q=viewer&start=0&count=500', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-Restli-Protocol-Version': '2.0.0'
            }
        });

        if (!connectionsResponse.ok) {
            throw new Error(`LinkedIn API error: ${connectionsResponse.status}`);
        }

        const connectionsData = await connectionsResponse.json();
        const connections = connectionsData.elements || [];

        // For each company, check if any LinkedIn connections work there
        for (const company of companies) {
            try {
                // Use AI to find which connections work at this company
                const matchData = await base44.integrations.Core.InvokeLLM({
                    prompt: `I have a list of LinkedIn connections and I want to find which ones work at "${company.name}".
                    
                    Here are my connections (limited data): ${JSON.stringify(connections.slice(0, 100))}
                    
                    For the company "${company.name}", check LinkedIn to see which of these connections currently work there.
                    Also check if any of these team members know people at ${company.name}: ${teamMembers.map(t => t.name).join(', ')}
                    
                    Return a list of people who work at this company and their connection to our team.`,
                    add_context_from_internet: true,
                    response_json_schema: {
                        type: 'object',
                        properties: {
                            connections: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        contact_name: { type: 'string' },
                                        contact_role: { type: 'string' },
                                        team_member: { type: 'string' },
                                        connection_notes: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                });

                const foundConnections = matchData.connections || [];

                if (foundConnections.length > 0) {
                    // Get existing alumni connections or create new array
                    const existingConnections = company.alumni_connections || [];
                    
                    // Add new connections
                    for (const conn of foundConnections) {
                        const alreadyExists = existingConnections.some(
                            existing => existing.team_member_name === conn.team_member && 
                                       existing.notes?.includes(conn.contact_name)
                        );

                        if (!alreadyExists) {
                            const teamMember = teamMembers.find(t => t.name === conn.team_member);
                            existingConnections.push({
                                team_member_name: conn.team_member || 'Network',
                                team_member_email: teamMember?.email || '',
                                connection_type: 'LinkedIn Connection',
                                notes: `${conn.contact_name} - ${conn.contact_role}. ${conn.connection_notes || ''}`
                            });
                            totalConnectionsFound++;
                        }
                    }

                    // Update company with new connections
                    if (existingConnections.length > (company.alumni_connections?.length || 0)) {
                        await base44.asServiceRole.entities.Company.update(company.id, {
                            alumni_connections: existingConnections
                        });
                        companiesUpdated++;
                    }
                }

                // Small delay to avoid overwhelming the AI
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`Failed to process ${company.name}:`, error);
            }
        }

        return Response.json({
            success: true,
            companies_checked: companies.length,
            companies_updated: companiesUpdated,
            total_connections_found: totalConnectionsFound,
            message: `Found ${totalConnectionsFound} connections across ${companiesUpdated} companies (checked ${companies.length} companies)`
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});