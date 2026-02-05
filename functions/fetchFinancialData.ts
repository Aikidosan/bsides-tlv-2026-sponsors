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
            return Response.json({ error: 'Stock symbol is required' }, { status: 400 });
        }

        const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
        
        // Fetch company overview (includes market cap)
        const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${stock_symbol}&apikey=${apiKey}`;
        const overviewRes = await fetch(overviewUrl);
        const overviewData = await overviewRes.json();

        // Fetch current quote
        const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock_symbol}&apikey=${apiKey}`;
        const quoteRes = await fetch(quoteUrl);
        const quoteData = await quoteRes.json();

        if (overviewData.Note || quoteData.Note) {
            return Response.json({ 
                error: 'API rate limit reached. Alpha Vantage free tier allows 25 requests/day.' 
            }, { status: 429 });
        }

        const financialData = {
            market_cap: parseFloat(overviewData.MarketCapitalization) || null,
            stock_price: parseFloat(quoteData['Global Quote']?.['05. price']) || null,
            analyst_rating: overviewData.AnalystTargetPrice ? 
                (parseFloat(overviewData.AnalystTargetPrice) > parseFloat(quoteData['Global Quote']?.['05. price']) ? 'Buy' : 'Hold') 
                : null,
            last_financial_update: new Date().toISOString(),
            stock_symbol: stock_symbol
        };

        // Update company if company_id provided
        if (company_id) {
            await base44.entities.Company.update(company_id, financialData);
        }

        return Response.json({ 
            success: true,
            data: financialData,
            raw_overview: overviewData,
            raw_quote: quoteData
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});