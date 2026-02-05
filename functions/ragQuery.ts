import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { query, limit = 10, document_type } = await req.json();

        if (!query) {
            return Response.json({ error: 'Query is required' }, { status: 400 });
        }

        // Get query embedding
        const embeddingResponse = await base44.integrations.Core.InvokeLLM({
            prompt: `Convert this text to a semantic search query: "${query}". Return only the refined query.`,
            add_context_from_internet: false
        });

        // Fetch all knowledge base documents
        let filterObj = {};
        if (document_type) {
            filterObj.document_type = document_type;
        }
        const docs = await base44.entities.KnowledgeBase.filter(filterObj, '-created_date', 100);

        if (docs.length === 0) {
            return Response.json({ results: [], message: 'No knowledge base documents found' });
        }

        // Score documents based on content relevance using semantic similarity
        const scoredDocs = docs.map(doc => {
            const queryLower = embeddingResponse.toLowerCase();
            const contentLower = doc.content.toLowerCase();
            
            // Simple relevance scoring
            let score = 0;
            
            // Exact phrase matches get high score
            if (contentLower.includes(queryLower)) {
                score += 100;
            }
            
            // Word matches
            const queryWords = queryLower.split(/\s+/).filter(w => w.length > 3);
            queryWords.forEach(word => {
                if (contentLower.includes(word)) {
                    score += 10;
                }
            });
            
            // Tag matches
            if (doc.tags) {
                doc.tags.forEach(tag => {
                    if (queryLower.includes(tag.toLowerCase())) {
                        score += 15;
                    }
                });
            }
            
            return {
                ...doc,
                relevance_score: score
            };
        }).filter(doc => doc.relevance_score > 0)
         .sort((a, b) => b.relevance_score - a.relevance_score)
         .slice(0, limit);

        return Response.json({
            results: scoredDocs,
            count: scoredDocs.length
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});