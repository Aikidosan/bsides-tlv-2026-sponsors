import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { linkedin_url } = await req.json();
    
    if (!linkedin_url) {
      return Response.json({ error: 'LinkedIn URL is required' }, { status: 400 });
    }

    const WIZA_API_KEY = Deno.env.get('WIZA_API_KEY');
    
    if (!WIZA_API_KEY) {
      return Response.json({ error: 'Wiza API key not configured' }, { status: 500 });
    }

    // Call Wiza API to find email from LinkedIn URL
    const wizaResponse = await fetch('https://api.wiza.co/api/v1/prospects/find', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WIZA_API_KEY}`
      },
      body: JSON.stringify({
        linkedin_url: linkedin_url
      })
    });

    if (!wizaResponse.ok) {
      const errorText = await wizaResponse.text();
      console.error('Wiza API error:', errorText);
      return Response.json({ 
        error: 'Failed to find email with Wiza',
        details: errorText 
      }, { status: wizaResponse.status });
    }

    const data = await wizaResponse.json();
    
    return Response.json({
      email: data.email || null,
      phone: data.phone || null,
      first_name: data.first_name || null,
      last_name: data.last_name || null,
      title: data.title || null,
      company: data.company || null
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});