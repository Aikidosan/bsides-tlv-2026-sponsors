import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const companies = await base44.asServiceRole.entities.Company.filter({});
        
        let updated = 0;
        let checked = 0;
        const results = [];

        for (const company of companies) {
            checked++;
            
            try {
                // Search for the company on Google Finance
                const searchQuery = `${company.name} stock symbol site:google.com/finance`;
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
                
                const response = await fetch(searchUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                const html = await response.text();
                
                // Look for stock ticker patterns (e.g., NASDAQ:VRNS, NYSE:PANW)
                const tickerPatterns = [
                    /(?:NASDAQ|NYSE|NYSEARCA|TSX|LSE|HKEX):\s*([A-Z]{1,5})/gi,
                    /Ticker[:\s]+([A-Z]{1,5})/gi,
                    /Symbol[:\s]+([A-Z]{1,5})/gi
                ];
                
                let stockSymbol = null;
                let exchange = null;
                
                for (const pattern of tickerPatterns) {
                    const matches = [...html.matchAll(pattern)];
                    if (matches.length > 0) {
                        stockSymbol = matches[0][1];
                        const fullMatch = matches[0][0];
                        if (fullMatch.includes('NASDAQ')) exchange = 'NASDAQ';
                        else if (fullMatch.includes('NYSE')) exchange = 'NYSE';
                        break;
                    }
                }
                
                // If we found a ticker, it's likely public
                if (stockSymbol && (exchange === 'NASDAQ' || exchange === 'NYSE' || exchange === 'NYSEARCA')) {
                    await base44.asServiceRole.entities.Company.update(company.id, {
                        profile_type: 'public',
                        stock_symbol: stockSymbol
                    });
                    
                    updated++;
                    results.push({
                        company: company.name,
                        status: 'updated',
                        symbol: stockSymbol,
                        exchange: exchange
                    });
                } else {
                    results.push({
                        company: company.name,
                        status: 'not_found',
                        current_type: company.profile_type
                    });
                }
                
                // Rate limiting - wait 2 seconds between requests
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (error) {
                results.push({
                    company: company.name,
                    status: 'error',
                    error: error.message
                });
            }
        }

        return Response.json({
            success: true,
            message: `Checked ${checked} companies, updated ${updated} to public status`,
            checked,
            updated,
            results
        });

    } catch (error) {
        return Response.json({ 
            error: error.message,
            details: error.stack 
        }, { status: 500 });
    }
});