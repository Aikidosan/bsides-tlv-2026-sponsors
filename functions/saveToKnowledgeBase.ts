import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, content, document_type, company_id, tags, source } = await req.json();

        if (!title || !content || !document_type) {
            return Response.json({ 
                error: 'title, content, and document_type are required' 
            }, { status: 400 });
        }

        // Check if document already exists to avoid duplicates
        const existing = await base44.entities.KnowledgeBase.filter({
            title: title,
            document_type: document_type
        });

        if (existing.length > 0) {
            return Response.json({ 
                success: false, 
                message: 'Document already exists in knowledge base'
            });
        }

        // Save to knowledge base
        const doc = await base44.entities.KnowledgeBase.create({
            title,
            content,
            document_type,
            company_id: company_id || null,
            tags: tags || [],
            source: source || 'manual',
            embedding: [] // Placeholder - can add real embeddings later
        });

        return Response.json({
            success: true,
            doc_id: doc.id,
            message: 'Document saved to knowledge base'
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});