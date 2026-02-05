import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { company_id } = await req.json();

        // Get company details
        const company = await base44.entities.Company.filter({ id: company_id });
        if (!company.length) {
            return Response.json({ error: 'Company not found' }, { status: 404 });
        }

        const companyData = company[0];
        const companyName = companyData.name;

        // Use AI with web search to fetch financial data from Growjo and other sources
        const response = await base44.integrations.Core.InvokeLLM({
            prompt: `Search Growjo and other sources for financial data on the company: ${companyName}. 
            
            Find and return the following information in JSON format:
            - funding_raised: Total funding raised (in USD)
            - latest_funding_round: Latest funding round amount and date
            - funding_stage: Current funding stage (seed, series A, B, C, etc.)
            - valuation: Latest valuation if available (in USD)
            - investor_count: Number of investors
            - employee_count: Approximate employee count if available
            - headquarters: Company headquarters location
            - founded_year: Year founded
            
            Prioritize Growjo data if available. If information is not available, use null for that field.`,
            add_context_from_internet: true,
            response_json_schema: {
                type: "object",
                properties: {
                    funding_raised: { type: ["number", "null"] },
                    latest_funding_round: { 
                        type: ["object", "null"],
                        properties: {
                            amount: { type: "number" },
                            date: { type: "string" }
                        }
                    },
                    funding_stage: { type: ["string", "null"] },
                    valuation: { type: ["number", "null"] },
                    investor_count: { type: ["number", "null"] },
                    employee_count: { type: ["number", "null"] },
                    headquarters: { type: ["string", "null"] },
                    founded_year: { type: ["number", "null"] }
                }
            }
        });

        // Update company with fetched data
        await base44.entities.Company.update(company_id, {
            ai_research: JSON.stringify(response),
            last_financial_update: new Date().toISOString()
        });

        return Response.json({ success: true, data: response });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});