import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { email, linkedin_url } = await req.json();

    if (!email || !linkedin_url) {
      return Response.json({ error: 'Email and LinkedIn URL required' }, { status: 400 });
    }

    // Fetch the user
    const users = await base44.asServiceRole.entities.User.filter({ email });
    
    if (!users || users.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const targetUser = users[0];
    
    // Update with the LinkedIn profile
    const updatedData = {
      ...targetUser.data,
      linkedin_profile: linkedin_url,
      linkedin_verified: true
    };

    await base44.asServiceRole.entities.User.update(targetUser.id, {
      data: updatedData
    });

    return Response.json({ 
      success: true, 
      message: `Updated LinkedIn profile for ${email}` 
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});