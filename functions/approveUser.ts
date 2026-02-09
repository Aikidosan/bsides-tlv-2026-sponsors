import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { userId } = await req.json();

        if (!userId) {
            return Response.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Get the user to approve
        const targetUser = await base44.asServiceRole.entities.User.get(userId);
        
        // Update with verified status
        await base44.asServiceRole.entities.User.update(userId, {
            data: {
                ...(targetUser.data || {}),
                linkedin_verified: true
            }
        });

        return Response.json({ 
            success: true,
            message: 'User approved successfully' 
        });
    } catch (error) {
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});