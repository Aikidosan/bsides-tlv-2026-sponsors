import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - admin only' }, { status: 403 });
    }

    // Invite user
    await base44.users.inviteUser('oren.efraim@gmail.com', 'user');
    
    // Update their profile with LinkedIn URL
    const users = await base44.asServiceRole.entities.User.filter({ email: 'oren.efraim@gmail.com' });
    if (users.length > 0) {
      await base44.asServiceRole.entities.User.update(users[0].id, {
        data: {
          linkedin_profile: 'https://www.linkedin.com/in/orenefr/',
          linkedin_url: 'https://www.linkedin.com/in/orenefr/'
        }
      });
    }
    
    return Response.json({ 
      success: true, 
      message: 'Invitation sent to Oren Efraim with LinkedIn profile' 
    });
  } catch (error) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});