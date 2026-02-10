import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { company_id } = await req.json();

        if (!company_id) {
            return Response.json({ error: 'company_id required' }, { status: 400 });
        }

        // Get the company
        const company = await base44.asServiceRole.entities.Company.get(company_id);

        if (!company) {
            return Response.json({ error: 'Company not found' }, { status: 404 });
        }

        // Get user's LinkedIn profile URL from their data
        const userLinkedInUrl = user.data?.linkedin_url;

        if (!userLinkedInUrl) {
            return Response.json({ 
                error: 'LinkedIn profile not found. Please update your profile with your LinkedIn URL.' 
            }, { status: 400 });
        }

        // Use AI to search for connections
        const searchResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `Search LinkedIn to find connections between the user "${user.full_name}" (LinkedIn: ${userLinkedInUrl}) and people working at "${company.name}".

Look for:
1. People currently working at ${company.name} who are connected to ${user.full_name}
2. Mutual connections or shared experiences (same schools, previous companies, etc.)
3. Any relevant relationship that could help with outreach

Return detailed information about any connections found.`,
            add_context_from_internet: true,
            response_json_schema: {
                type: 'object',
                properties: {
                    has_connections: { type: 'boolean' },
                    connections: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                contact_name: { type: 'string' },
                                contact_title: { type: 'string' },
                                contact_linkedin: { type: 'string' },
                                connection_type: { type: 'string' },
                                connection_strength: { 
                                    type: 'string',
                                    enum: ['direct', 'mutual', 'alumni', 'weak']
                                },
                                notes: { type: 'string' }
                            }
                        }
                    }
                }
            }
        });

        const foundConnections = searchResult.connections || [];

        // If connections found, update the company
        if (foundConnections.length > 0) {
            const existingConnections = company.alumni_connections || [];
            
            for (const conn of foundConnections) {
                const alreadyExists = existingConnections.some(
                    existing => existing.notes?.includes(conn.contact_name)
                );

                if (!alreadyExists) {
                    existingConnections.push({
                        team_member_name: user.full_name,
                        team_member_email: user.email,
                        connection_type: conn.connection_type || 'LinkedIn Connection',
                        notes: `${conn.contact_name} - ${conn.contact_title || 'Unknown role'} (${conn.connection_strength || 'connection'}). ${conn.notes || ''}`
                    });
                }
            }

            // Update company if new connections were added
            if (existingConnections.length > (company.alumni_connections?.length || 0)) {
                await base44.asServiceRole.entities.Company.update(company.id, {
                    alumni_connections: existingConnections
                });
            }
        }

        return Response.json({
            success: true,
            company_name: company.name,
            has_connections: foundConnections.length > 0,
            connections_found: foundConnections.length,
            connections: foundConnections
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});