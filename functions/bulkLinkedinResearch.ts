import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all companies without decision makers
        const companies = await base44.entities.Company.list();
        const companiesNeedingResearch = companies.filter(c => 
            !c.decision_makers || c.decision_makers.length === 0
        );

        const results = [];
        let processed = 0;
        let failed = 0;

        // Process each company
        for (const company of companiesNeedingResearch) {
            try {
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

                // Update company with decision makers
                await base44.entities.Company.update(company.id, {
                    decision_makers: research.decision_makers || []
                });

                processed++;
                results.push({
                    company: company.name,
                    success: true,
                    decision_makers_found: research.decision_makers?.length || 0
                });
            } catch (error) {
                failed++;
                results.push({
                    company: company.name,
                    success: false,
                    error: error.message
                });
            }
        }

        return Response.json({ 
            success: true,
            total: companiesNeedingResearch.length,
            processed,
            failed,
            results
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});