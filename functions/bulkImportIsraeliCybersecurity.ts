import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const companiesData = [
            // Major Unicorns & Large Companies
            { name: 'Wiz, Inc.', industry: 'Cloud Security', size: 'large', profile_type: 'private', notes: 'Cloud security platform, founded 2020' },
            { name: 'Check Point Software Technologies Ltd', industry: 'Network Security', size: 'enterprise', profile_type: 'public', notes: 'Global cybersecurity leader, Israeli-founded' },
            { name: 'Palo Alto Networks Inc', industry: 'Network Security', size: 'enterprise', profile_type: 'public', notes: 'Major player with Israeli R&D, acquired Talon and Dig Security' },
            { name: 'Orca Security', industry: 'Cloud Security', size: 'large', profile_type: 'private', notes: 'Cloud security, founded by Check Point alumni' },
            { name: 'Upwind Security', industry: 'Cloud Security', size: 'large', profile_type: 'private', notes: 'Unicorn as of January 2026, $1.5B valuation' },
            { name: 'Cyera', industry: 'Data Security', size: 'large', profile_type: 'private', notes: 'Data security platform' },
            { name: 'Axonius', industry: 'Asset Management', size: 'large', profile_type: 'private', notes: 'Asset management and security' },
            { name: 'Island', industry: 'Endpoint Security', size: 'large', profile_type: 'private', notes: 'Enterprise browser security' },
            
            // Rising Startups
            { name: 'Grip Security', industry: 'SaaS Security', size: 'medium', profile_type: 'private', notes: 'SaaS security control platform' },
            { name: 'Wing Security', industry: 'SaaS Security', size: 'medium', profile_type: 'private', notes: 'SaaS security posture management' },
            { name: 'Noma Security', industry: 'Application Security', size: 'small', profile_type: 'private', notes: 'Application security for data & AI lifecycle' },
            { name: 'Token Security', industry: 'Identity Security', size: 'small', profile_type: 'private', notes: 'Identity security platform' },
            { name: 'Gomboc', industry: 'Security Operations', size: 'small', profile_type: 'private', notes: 'Security operations platform' },
            { name: 'Descope', industry: 'Identity & Access', size: 'medium', profile_type: 'private', notes: 'Authentication platform' },
            { name: 'Astrix Security', industry: 'Identity Security', size: 'small', profile_type: 'private', notes: 'Non-human identity security' },
            
            // Recently Founded
            { name: 'Novee Security', industry: 'AI Security', size: 'startup', profile_type: 'private', notes: 'AI penetration testing, founded 2025' },
            { name: 'Act', industry: 'Cloud Security', size: 'startup', profile_type: 'private', notes: 'Medigate spinoff securing cloud & data hubs, founded 2025' },
            { name: 'Zeroport', industry: 'Network Security', size: 'startup', profile_type: 'private', notes: 'Non-IP secure remote access, founded 2025' },
            { name: 'Tenzai', industry: 'AI Security', size: 'startup', profile_type: 'private', notes: 'AI hacker simulation, founded 2025' },
            { name: 'Clover Security', industry: 'Application Security', size: 'startup', profile_type: 'private', notes: 'Design-led product security, founded 2023' },
            { name: 'Malanta', industry: 'Enterprise Security', size: 'startup', profile_type: 'private', notes: 'Enterprise security for pre-attack era, founded 2024' },
            { name: 'Cyata Security', industry: 'Identity Security', size: 'startup', profile_type: 'private', notes: 'Control plane for agentic identity, founded 2024' },
            { name: 'Nokod Security', industry: 'Application Security', size: 'startup', profile_type: 'private', notes: 'Low-code/no-code app security, founded 2023' },
            
            // Established Mid-Size Companies
            { name: 'Pentera', industry: 'Vulnerability Management', size: 'medium', profile_type: 'private', notes: 'Automated security validation, founded 2015' },
            { name: 'Sygnia', industry: 'Incident Response', size: 'medium', profile_type: 'private', notes: 'Elite cyber consulting and incident response, founded 2015' },
            { name: 'CYREBRO', industry: 'SOC Platform', size: 'medium', profile_type: 'private', notes: 'Cloud-based interactive SOC platform, founded 2013' },
            { name: 'Axiom Security', industry: 'Identity & Access', size: 'medium', profile_type: 'private', notes: 'Privileged access management, founded 2021' },
            { name: 'Cytactic', industry: 'Cybersecurity', size: 'medium', profile_type: 'private', notes: 'Cyber security solutions, founded 2022' },
            
            // Specialized Security Companies
            { name: 'BioCatch Ltd.', industry: 'Identity & Access', size: 'medium', profile_type: 'private', notes: 'Behavioral biometrics and identity verification' },
            { name: 'Secret Double Octopus', industry: 'Identity & Access', size: 'small', profile_type: 'private', notes: 'Passwordless authentication' },
            { name: 'Aqua Security Software Ltd.', industry: 'Cloud Security', size: 'medium', profile_type: 'private', notes: 'Container and cloud security' },
            { name: 'Orca Security', industry: 'Cloud Security', size: 'large', profile_type: 'private', notes: 'Cloud security platform' },
            { name: 'Deep Instinct Ltd.', industry: 'Endpoint Security', size: 'medium', profile_type: 'private', notes: 'AI-powered endpoint protection' },
            { name: 'Intezer Labs', industry: 'Threat Intelligence', size: 'medium', profile_type: 'private', notes: 'Threat intelligence and code analysis' },
            { name: 'ThetaRay', industry: 'Threat Detection', size: 'medium', profile_type: 'private', notes: 'Advanced anomaly detection' },
            { name: 'SecBI', industry: 'Threat Detection', size: 'small', profile_type: 'private', notes: 'Behavioral analytics and threat detection' },
            { name: 'Radware', industry: 'Network Security', size: 'medium', profile_type: 'public', notes: 'DDoS protection and application security' },
            { name: 'Waterfall Security Solutions', industry: 'Network Security', size: 'small', profile_type: 'private', notes: 'OT/IT security' },
            { name: 'CYBERBIT Ltd.', industry: 'Cybersecurity Training', size: 'medium', profile_type: 'private', notes: 'Cybersecurity simulation and training' },
            { name: 'Reblaze', industry: 'Application Security', size: 'small', profile_type: 'private', notes: 'Web application firewall and DDoS protection' },
            { name: 'Votiro Cybersec Ltd.', industry: 'Data Security', size: 'small', profile_type: 'private', notes: 'File security and content disarm' },
            { name: 'Argus Cyber Security', industry: 'Automotive Security', size: 'small', profile_type: 'private', notes: 'Connected vehicle cybersecurity' },
            { name: 'Cybellum Ltd.', industry: 'Automotive Security', size: 'small', profile_type: 'private', notes: 'Software supply chain security' },
            { name: 'Cymmetria', industry: 'Vulnerability Management', size: 'small', profile_type: 'private', notes: 'Deception technology' },
            { name: 'Indegy', industry: 'Vulnerability Management', size: 'small', profile_type: 'private', notes: 'Critical infrastructure security' },
            { name: 'IRONSCALES', industry: 'Email Security', size: 'small', profile_type: 'private', notes: 'Email security and phishing protection' },
            { name: 'Sternum', industry: 'Endpoint Security', size: 'small', profile_type: 'private', notes: 'IoT device security' },
            
            // Additional Companies by Location
            { name: 'CybeRisk', industry: 'Cybersecurity', size: 'small', profile_type: 'private', notes: 'Based in Tel Aviv area' },
            { name: 'CyKick Labs', industry: 'Cybersecurity', size: 'small', profile_type: 'private', notes: 'Based in Tel Aviv area' },
            { name: 'Coronet Cyber Security', industry: 'Cybersecurity', size: 'small', profile_type: 'private', notes: 'Based in Tel Aviv area' },
            { name: 'Cyberpion', industry: 'Digital Risk Protection', size: 'medium', profile_type: 'private', notes: 'Based in Tel Aviv area' },
            { name: 'Cympire', industry: 'Cybersecurity', size: 'small', profile_type: 'private', notes: 'Based in Tel Aviv area' },
            { name: 'Cytegic', industry: 'Cybersecurity', size: 'small', profile_type: 'private', notes: 'Based in Tel Aviv area' },
            { name: 'NetSpark', industry: 'Network Security', size: 'small', profile_type: 'private', notes: 'Based in Tel Aviv area' },
            { name: 'SecurityDam Ltd.', industry: 'Cybersecurity', size: 'small', profile_type: 'private', notes: 'Based in Tel Aviv area' },
            { name: 'Cobwebs Technologies', industry: 'OSINT', size: 'small', profile_type: 'private', notes: 'Based in Herzliya' },
            { name: 'Kaymera Technologies', industry: 'Mobile Security', size: 'small', profile_type: 'private', notes: 'Based in Herzliya' },
            { name: 'Nation-E', industry: 'Cybersecurity', size: 'small', profile_type: 'private', notes: 'Based in Herzliya' },
            { name: 'SafeDK Mobile', industry: 'Mobile Security', size: 'small', profile_type: 'private', notes: 'Based in Herzliya' },
            { name: 'TopSpin Security', industry: 'Web Security', size: 'small', profile_type: 'private', notes: 'Based in Herzliya' },
            { name: 'CloudAlly', industry: 'Cloud Backup', size: 'small', profile_type: 'private', notes: 'Based in Ra\'anana' },
            { name: 'Cyber Secdo', industry: 'Cybersecurity', size: 'small', profile_type: 'private', notes: 'Based in Ra\'anana' },
            { name: 'CTERA Networks', industry: 'Cloud Storage Security', size: 'small', profile_type: 'private', notes: 'Based in Petah Tikva' },
            { name: 'CyberInt', industry: 'Threat Intelligence', size: 'small', profile_type: 'private', notes: 'Based in Petah Tikva' },
            { name: 'Seculert', industry: 'Threat Intelligence', size: 'small', profile_type: 'private', notes: 'Based in Petah Tikva' },
            { name: 'CYBONET', industry: 'Cybersecurity', size: 'small', profile_type: 'private', notes: 'Based in Hura' },
            { name: 'BackBox Software', industry: 'Cybersecurity', size: 'small', profile_type: 'private', notes: 'Based in Rosh Haayin' },
            { name: 'CyberObserver', industry: 'Threat Intelligence', size: 'small', profile_type: 'private', notes: 'Based in Caesarea' },
            { name: 'Re-Sec Technologies', industry: 'Cybersecurity', size: 'small', profile_type: 'private', notes: 'Based in Caesarea' },
            { name: 'Safe-T Data', industry: 'Data Protection', size: 'small', profile_type: 'private', notes: 'Based in Baqa al-Gharbiyye' },
            { name: 'empow Cyber Security', industry: 'Cybersecurity', size: 'small', profile_type: 'private', notes: 'Based in Ramat Gan' },
            { name: 'BUFFERZONE Security', industry: 'Threat Prevention', size: 'small', profile_type: 'private', notes: 'Based in Tel Aviv-Yafo' },
            { name: 'Nubo Software', industry: 'Cloud DLP', size: 'small', profile_type: 'private', notes: 'Based in Menahemia' },
            
            // International Companies with Israeli Operations
            { name: 'SentinelOne Inc', industry: 'Endpoint Security', size: 'large', profile_type: 'public', notes: 'Founded in Israel, publicly traded' },
            { name: 'CrowdStrike', industry: 'Endpoint Security', size: 'enterprise', profile_type: 'public', notes: 'Israeli operations' },
        ];

        // Get existing companies to avoid duplicates
        const existingCompanies = await base44.asServiceRole.entities.Company.list();
        const existingNames = new Set(existingCompanies.map(c => c.name.toLowerCase().trim()));

        // Filter out duplicates
        const newCompanies = companiesData.filter(company => 
            !existingNames.has(company.name.toLowerCase().trim())
        );

        // Remove duplicates within the import list itself
        const uniqueCompanies = [];
        const seenNames = new Set();
        for (const company of newCompanies) {
            const normalizedName = company.name.toLowerCase().trim();
            if (!seenNames.has(normalizedName)) {
                seenNames.add(normalizedName);
                uniqueCompanies.push(company);
            }
        }

        // Bulk create only new companies
        const created = uniqueCompanies.length > 0 
            ? await base44.asServiceRole.entities.Company.bulkCreate(uniqueCompanies)
            : [];
        
        return Response.json({ 
            success: true, 
            count: created.length,
            skipped: companiesData.length - uniqueCompanies.length,
            message: `Successfully imported ${created.length} companies (${companiesData.length - uniqueCompanies.length} duplicates skipped)`
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});