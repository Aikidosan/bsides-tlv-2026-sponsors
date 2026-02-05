import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { company_id, company_name } = await req.json();

        if (!company_id && !company_name) {
            return Response.json({ error: 'Either company_id or company_name is required' }, { status: 400 });
        }

        // Get company details if only ID provided
        let name = company_name;
        if (company_id && !company_name) {
            const company = await base44.entities.Company.filter({ id: company_id });
            if (!company.length) {
                return Response.json({ error: 'Company not found' }, { status: 404 });
            }
            name = company[0].name;
        }

        // Research company using LLM with web search
        const response = await base44.integrations.Core.InvokeLLM({
            prompt: `Perform comprehensive research on the company: ${name}
            
Find and return the following information in JSON format. Use current, accurate data:
- website: Company website URL
- industry: Primary industry/sector (e.g., "Cybersecurity", "Cloud Computing")
- size: Company size - one of: startup, small, medium, large, enterprise (based on employee count)
- founded_year: Year the company was founded
- headquarters: Company headquarters location (city, country)
- funding_raised: Total funding raised in USD (if available)
- valuation: Latest valuation in USD (if available)
- latest_funding_date: Date of latest funding round
- investor_count: Number of investors
- employee_count: Approximate number of employees
- decision_makers: Array of key decision makers with their names, titles, and LinkedIn profile URLs

Be thorough and accurate. For Israeli companies, prioritize Israeli databases and sources. If a field is not available, use null.`,
            add_context_from_internet: true,
            response_json_schema: {
                type: "object",
                properties: {
                    website: { type: ["string", "null"] },
                    industry: { type: ["string", "null"] },
                    size: { type: ["string", "null"], enum: ["startup", "small", "medium", "large", "enterprise", null] },
                    founded_year: { type: ["number", "null"] },
                    headquarters: { type: ["string", "null"] },
                    funding_raised: { type: ["number", "null"] },
                    valuation: { type: ["number", "null"] },
                    latest_funding_date: { type: ["string", "null"] },
                    investor_count: { type: ["number", "null"] },
                    employee_count: { type: ["number", "null"] },
                    decision_makers: {
                        type: ["array", "null"],
                        items: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                title: { type: "string" },
                                linkedin_url: { type: ["string", "null"] }
                            }
                        }
                    }
                }
            }
        });

        // Prepare update data, filtering out null values and mapping to entity fields
        const updateData = {};
        if (response.website) updateData.website = response.website;
        if (response.industry) updateData.industry = response.industry;
        if (response.size) updateData.size = response.size;
        if (response.headquarters) updateData.headquarters = response.headquarters;
        if (response.funding_raised) updateData.funding_raised = response.funding_raised;
        if (response.valuation) updateData.valuation = response.valuation;
        if (response.investor_count) updateData.investor_count = response.investor_count;
        if (response.employee_count) updateData.employee_count = response.employee_count;
        if (response.decision_makers && response.decision_makers.length > 0) {
            updateData.decision_makers = response.decision_makers;
        }
        updateData.ai_research = JSON.stringify(response);
        updateData.last_financial_update = new Date().toISOString();

        // Update company if company_id provided
        if (company_id) {
            await base44.entities.Company.update(company_id, updateData);
        }

        return Response.json({ 
            success: true, 
            data: response,
            updated_fields: Object.keys(updateData)
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});