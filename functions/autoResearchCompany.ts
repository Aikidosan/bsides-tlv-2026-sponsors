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

        // Get existing company data
        let existingCompany = null;
        let name = company_name;
        if (company_id) {
            const companies = await base44.entities.Company.filter({ id: company_id });
            if (!companies.length) {
                return Response.json({ error: 'Company not found' }, { status: 404 });
            }
            existingCompany = companies[0];
            name = existingCompany.name;
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
        - decision_makers: Array of key decision makers BASED IN ISRAEL with their names, titles, and LinkedIn profile URLs. IMPORTANT: Specifically find and include the CFO, CTO, HR Director/VP, and Marketing Director/VP/CMO roles if they exist in Israel. Focus on Israeli team members only.

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

        // Prepare update data, preserving existing fields
        const updateData = {};
        
        // Only update fields that came back from research and weren't already set
         if (response.website && !existingCompany?.website) updateData.website = response.website;
         if (response.industry && !existingCompany?.industry) updateData.industry = response.industry;
         if (response.size && !existingCompany?.size) updateData.size = response.size;
         if (response.headquarters && !existingCompany?.headquarters) updateData.headquarters = response.headquarters;
         if (response.funding_raised && !existingCompany?.funding_raised) updateData.funding_raised = response.funding_raised;
         if (response.valuation && !existingCompany?.valuation) updateData.valuation = response.valuation;
         if (response.investor_count && !existingCompany?.investor_count) updateData.investor_count = response.investor_count;
         if (response.employee_count && !existingCompany?.employee_count) updateData.employee_count = response.employee_count;

         // Extract specific roles from decision makers
         if (response.decision_makers && response.decision_makers.length > 0) {
             const cfo = response.decision_makers.find(dm => dm.title?.toLowerCase().includes('cfo'));
             const marketing = response.decision_makers.find(dm => dm.title?.toLowerCase().match(/(marketing|cmo)/));
             const sales = response.decision_makers.find(dm => dm.title?.toLowerCase().match(/(sales|revenue)/));

             if (cfo && !existingCompany?.cfo_name) {
                 updateData.cfo_name = cfo.name;
                 updateData.cfo_email = cfo.email || null;
             }
             if (marketing && !existingCompany?.marketing_name) {
                 updateData.marketing_name = marketing.name;
                 updateData.marketing_email = marketing.email || null;
             }
             if (sales && !existingCompany?.sales_name) {
                 updateData.sales_name = sales.name;
                 updateData.sales_email = sales.email || null;
             }
         }
        
        // For decision makers, merge with existing ones instead of replacing
        if (response.decision_makers && response.decision_makers.length > 0) {
            const existingDMs = existingCompany?.decision_makers || [];
            const newNames = response.decision_makers.map(dm => dm.name.toLowerCase());
            const existingNames = existingDMs.map(dm => dm.name.toLowerCase());
            
            // Only add decision makers that don't already exist
            const dmToAdd = response.decision_makers.filter(
                dm => !existingNames.includes(dm.name.toLowerCase())
            );
            
            if (dmToAdd.length > 0) {
                updateData.decision_makers = [...existingDMs, ...dmToAdd];
            }
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