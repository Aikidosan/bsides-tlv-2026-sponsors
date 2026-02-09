import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ALLOWED_PROFILES = [
  { url: 'linkedin.com/in/ariel-mitiushkin', role: 'admin' },
  { url: 'https://www.linkedin.com/in/guy-desau/', role: 'user' },
  { url: 'https://www.linkedin.com/in/kerenlerner/', role: 'user' },
  { url: 'https://www.linkedin.com/in/avital-aviv-a778b01b2/', role: 'user' },
  { url: 'https://www.linkedin.com/in/edenkatz5/', role: 'user' }
];

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get LinkedIn access token
        const accessToken = await base44.asServiceRole.connectors.getAccessToken('linkedin');

        // Fetch user's LinkedIn profile
        const linkedinResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!linkedinResponse.ok) {
            return Response.json({ 
                verified: false, 
                message: 'Failed to fetch LinkedIn profile' 
            }, { status: 400 });
        }

        const linkedinData = await linkedinResponse.json();
        const linkedinUrl = linkedinData.sub || '';
        
        // Normalize the LinkedIn ID/URL for comparison
        const normalizedLinkedinId = linkedinUrl.toLowerCase();

        // Check if the profile is in the allowed list
        const matchedProfile = ALLOWED_PROFILES.find(profile => {
            const normalizedAllowed = profile.url.toLowerCase()
                .replace(/^https?:\/\//, '')
                .replace(/^www\./, '')
                .replace(/\/$/, '');
            
            return normalizedLinkedinId.includes(normalizedAllowed) || 
                   normalizedAllowed.includes(normalizedLinkedinId);
        });

        if (!matchedProfile) {
            return Response.json({ 
                verified: false, 
                message: 'This LinkedIn profile is not authorized to access the app. Please contact the admin.' 
            }, { status: 403 });
        }

        // Update user with verified LinkedIn profile
        await base44.asServiceRole.entities.User.update(user.id, {
            linkedin_profile: linkedinUrl,
            linkedin_verified: true
        });

        return Response.json({ 
            verified: true, 
            message: 'LinkedIn profile verified successfully!',
            linkedin_data: linkedinData
        });
    } catch (error) {
        return Response.json({ 
            verified: false, 
            message: error.message 
        }, { status: 500 });
    }
});