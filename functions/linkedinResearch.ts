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
            return Response.json({ error: 'company_id is required' }, { status: 400 });
        }

        // Get company details
        const company = await base44.entities.Company.get(company_id);

        if (!company) {
            return Response.json({ error: 'Company not found' }, { status: 404 });
        }

        // Use LLM to research decision makers on LinkedIn
        const research = await base44.integrations.Core.InvokeLLM({
            prompt: `Research the company "${company.name}" (website: ${company.website || 'N/A'}) on LinkedIn and find 3 potential decision makers who would be relevant for sponsorship decisions (e.g., CEO, CMO, VP Marketing, HR Director, etc.). 
            
            For each person, provide:
            - Full name
            - Current job title at this company
            - LinkedIn profile URL (if available)
            
            Focus on executives and senior management who handle marketing, sponsorships, partnerships, or community engagement.`,
            add_context_from_internet: true,
            response_json_schema: {
                type: "object",
                properties: {
                    decision_makers: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                title: { type: "string" },
                                linkedin_url: { type: "string" }
                            }
                        }
                    }
                }
            }
        });

        // Merge new decision makers with existing ones
        const existingDecisionMakers = company.decision_makers || [];
        const newDecisionMakers = research.decision_makers || [];
        
        // Combine and deduplicate by name
        const mergedDecisionMakers = [...existingDecisionMakers];
        for (const newDM of newDecisionMakers) {
            const exists = existingDecisionMakers.some(dm => 
                dm.name?.toLowerCase() === newDM.name?.toLowerCase()
            );
            if (!exists) {
                mergedDecisionMakers.push(newDM);
            }
        }
        
        await base44.entities.Company.update(company_id, {
            decision_makers: mergedDecisionMakers
        });

        return Response.json({ 
            success: true,
            decision_makers: research.decision_makers 
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});