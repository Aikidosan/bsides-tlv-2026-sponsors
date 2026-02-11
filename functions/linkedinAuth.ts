import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ALLOWED_PROFILES = [
  { url: 'linkedin.com/in/ariel-mitiushkin', role: 'admin' },
  { url: 'https://www.linkedin.com/in/guy-desau/', role: 'user' },
  { url: 'https://www.linkedin.com/in/kerenlerner/', role: 'user' },
  { url: 'https://www.linkedin.com/in/avital-aviv-a778b01b2/', role: 'user' },
  { url: 'https://www.linkedin.com/in/edenkatz5/', role: 'user' },
  { url: 'https://www.linkedin.com/in/lisa-akselrod-35766316/', role: 'user' },
  { url: 'https://www.linkedin.com/in/reut-menashe/', role: 'user' }
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

        // Fetch LinkedIn profile
        const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!profileResponse.ok) {
            throw new Error('Failed to fetch LinkedIn profile');
        }

        const profile = await profileResponse.json();
        
        // Extract LinkedIn profile URL from the sub field or construct it
        // LinkedIn userinfo returns sub like "linkedin.com/in/username"
        const linkedinUrl = profile.sub || profile.profile || '';

        // Normalize the URL
        const normalizedInput = linkedinUrl.toLowerCase()
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .replace(/\/$/, '');

        // Check if authorized
        const matchedProfile = ALLOWED_PROFILES.find(profile => {
            const normalizedAllowed = profile.url.toLowerCase()
                .replace(/^https?:\/\//, '')
                .replace(/^www\./, '')
                .replace(/\/$/, '');
            
            return normalizedInput === normalizedAllowed;
        });

        if (!matchedProfile) {
            return Response.json({ 
                verified: false,
                message: 'Your LinkedIn profile is not authorized to access this app.',
                profile: profile
            });
        }

        // Update user with verified status
        const existingData = user.data || {};
        await base44.asServiceRole.entities.User.update(user.id, {
            role: matchedProfile.role,
            data: {
                ...existingData,
                linkedin_profile: `https://www.${normalizedInput}`,
                linkedin_verified: true,
                linkedin_name: profile.name,
                linkedin_email: profile.email
            }
        });

        return Response.json({ 
            verified: true,
            message: 'LinkedIn verified successfully!',
            profile: profile
        });
    } catch (error) {
        return Response.json({ 
            verified: false,
            message: error.message 
        }, { status: 500 });
    }
});