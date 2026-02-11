import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { company_id, stock_symbol } = await req.json();

        if (!stock_symbol) {
            return Response.json({ error: 'Stock symbol required' }, { status: 400 });
        }

        const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');

        // Fetch income statement from Alpha Vantage
        const incomeUrl = `https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${stock_symbol}&apikey=${apiKey}`;
        const incomeResponse = await fetch(incomeUrl);
        const incomeData = await incomeResponse.json();

        if (incomeData.Note || incomeData.Information) {
            return Response.json({ 
                error: 'API limit reached or invalid symbol. Try again later.' 
            }, { status: 429 });
        }

        const annualReports = incomeData.annualReports;
        if (!annualReports || annualReports.length === 0) {
            return Response.json({ error: 'No financial data available' }, { status: 404 });
        }

        // Get the most recent annual report
        const latestReport = annualReports[0];
        
        // Extract revenue and S&M expenses
        const revenue = parseFloat(latestReport.totalRevenue || 0);
        const sellingGeneral = parseFloat(latestReport.sellingGeneralAndAdministrative || 0);
        const researchDev = parseFloat(latestReport.researchAndDevelopment || 0);

        // Many tech companies report S&M separately, but Alpha Vantage groups it in SG&A
        // We'll use SG&A as a proxy for sales & marketing + admin expenses
        const salesMarketingExpense = sellingGeneral;
        const marketingPercentage = revenue > 0 ? (salesMarketingExpense / revenue * 100) : 0;

        // Use AI to get more detailed marketing budget estimate
        const prompt = `Company: ${stock_symbol}
Annual Revenue: $${(revenue / 1000000).toFixed(0)}M
SG&A Expenses: $${(sellingGeneral / 1000000).toFixed(0)}M
R&D Expenses: $${(researchDev / 1000000).toFixed(0)}M

Based on industry standards for cybersecurity/tech companies, what percentage of SG&A is typically allocated to marketing vs sales vs admin? Provide a realistic estimate of the marketing budget.

Return a JSON with:
{
  "estimated_marketing_budget": number (in USD),
  "marketing_percentage_of_revenue": number,
  "confidence": "high" | "medium" | "low",
  "reasoning": "brief explanation"
}`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            add_context_from_internet: true,
            response_json_schema: {
                type: "object",
                properties: {
                    estimated_marketing_budget: { type: "number" },
                    marketing_percentage_of_revenue: { type: "number" },
                    confidence: { type: "string" },
                    reasoning: { type: "string" }
                }
            }
        });

        // Update company record
        await base44.asServiceRole.entities.Company.update(company_id, {
            annual_revenue: revenue,
            sales_marketing_expense: salesMarketingExpense,
            marketing_budget_percentage: marketingPercentage,
            last_financial_update: new Date().toISOString()
        });

        return Response.json({
            success: true,
            stock_symbol: stock_symbol,
            annual_revenue: revenue,
            sales_marketing_expense: salesMarketingExpense,
            marketing_percentage: marketingPercentage.toFixed(2),
            ai_estimate: aiResponse,
            fiscal_year: latestReport.fiscalDateEnding
        });

    } catch (error) {
        console.error('Error fetching marketing budget:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});