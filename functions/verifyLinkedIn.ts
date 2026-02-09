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

        const { linkedin_url } = await req.json();

        if (!linkedin_url) {
            return Response.json({ 
                verified: false, 
                message: 'LinkedIn URL is required' 
            });
        }

        // Normalize the URL for comparison
        const normalizedInput = linkedin_url.toLowerCase()
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .replace(/\/$/, '');

        // Check if the profile is in the allowed list
        const matchedProfile = ALLOWED_PROFILES.find(profile => {
            const normalizedAllowed = profile.url.toLowerCase()
                .replace(/^https?:\/\//, '')
                .replace(/^www\./, '')
                .replace(/\/$/, '');
            
            return normalizedInput.includes(normalizedAllowed) || 
                   normalizedAllowed.includes(normalizedInput);
        });

        if (!matchedProfile) {
            return Response.json({ 
                verified: false, 
                message: 'This LinkedIn profile is not authorized to access the app. Please contact the admin.' 
            });
        }

        // Update user with verified LinkedIn profile and role
        await base44.asServiceRole.entities.User.update(user.id, {
            linkedin_profile: linkedin_url,
            linkedin_verified: true,
            role: matchedProfile.role
        });

        return Response.json({ 
            verified: true, 
            message: 'LinkedIn profile verified successfully!' 
        });
    } catch (error) {
        return Response.json({ 
            verified: false, 
            message: error.message 
        }, { status: 500 });
    }
});