import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use LLM to research comprehensive list of cybersecurity companies with Israel presence
        const research = await base44.integrations.Core.InvokeLLM({
            prompt: `Create a comprehensive list of cybersecurity, data security, and AI security companies that either:
1. Are Israeli-founded/headquartered companies
2. Have R&D centers or major offices in Israel
3. Have significant Israeli operations

For each company, provide:
- Company name
- Website URL (full https URL)
- Industry/focus area (be specific: cloud security, endpoint security, data security, identity security, application security, etc.)
- Company size (use one of: startup, small, medium, large, enterprise)
- Israel connection (brief note: "Israeli-founded", "R&D center in Israel", "Headquarters in Herzliya", etc.)

Include major players like:
- Varonis (data security, Israeli-founded, Herzliya office)
- CyberArk (identity security, Israeli-founded, Petah Tikva)
- SentinelOne (endpoint security, Israeli R&D center)
- Palo Alto Networks (major R&D center in Israel)
- Check Point (Israeli enterprise, headquarters in Tel Aviv)
- Wiz (Israeli cloud security unicorn)
- Cyera (Israeli data security startup)
- Snyk (Israeli-founded developer security)
- Torq (Israeli security automation)
- Orca Security (Israeli cloud security)
- Aqua Security (Israeli cloud-native security)
- Silverfort (Israeli identity protection)
- BioCatch (Israeli behavioral biometrics)
- Riskified (Israeli e-commerce fraud prevention)
- Armis (Israeli IoT security)
- Sygnia (Israeli cyber consulting)
- Hunters Security (Israeli SOC platform)
- Apiiro (Israeli application security)
- Coro (Israeli mid-market cybersecurity)
- CyberSixgill (Israeli threat intelligence)
- Tufin (Israeli network security)
- Claroty (Israeli industrial cybersecurity)
- Axonius (Israeli cyber asset management)
- Pentera (Israeli automated penetration testing)
- SafeBreach (Israeli breach and attack simulation)
- Checkmarx (Israeli application security)
- Guardicore (Israeli data center security, acquired by Akamai)
- Illusive Networks (Israeli deception technology)
- Deep Instinct (Israeli AI-powered threat prevention)
- Votiro (Israeli content disarm and reconstruction)
- XM Cyber (Israeli breach and attack simulation)
- Zone (Israeli secure browser)
- Salt Security (Israeli API security)
- Noname Security (Israeli API security)
- Island (Israeli enterprise browser)
- Talon Cyber Security (Israeli secure browser)
- Laminar (Israeli data security)
- Valence Security (Israeli SaaS security)
- OPSWAT (has Israel operations)
- Radware (Israeli application security)
- Imperva (Israeli-founded, acquired but still has Israel ops)

And any other major companies you find with Israel connections.

Be comprehensive - aim for 50+ companies.`,
            add_context_from_internet: true,
            response_json_schema: {
                type: "object",
                properties: {
                    companies: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                website: { type: "string" },
                                industry: { type: "string" },
                                size: { type: "string" },
                                israel_connection: { type: "string" }
                            }
                        }
                    }
                }
            }
        });

        const companiesList = research.companies || [];

        // Get existing companies to avoid duplicates
        const existingCompanies = await base44.asServiceRole.entities.Company.list();
        const existingNames = new Set(existingCompanies.map(c => c.name.toLowerCase()));

        // Filter out duplicates and prepare new companies
        const newCompanies = companiesList
            .filter(c => !existingNames.has(c.name.toLowerCase()))
            .map(c => ({
                name: c.name,
                website: c.website,
                industry: c.industry,
                size: c.size || 'medium',
                status: 'research',
                notes: `Israel Connection: ${c.israel_connection}`
            }));

        // Bulk create new companies
        if (newCompanies.length > 0) {
            await base44.asServiceRole.entities.Company.bulkCreate(newCompanies);
        }

        return Response.json({
            success: true,
            total_found: companiesList.length,
            new_companies_added: newCompanies.length,
            already_existed: companiesList.length - newCompanies.length,
            companies: newCompanies
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});