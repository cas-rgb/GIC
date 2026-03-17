export interface Influencer {
    name: string;
    role: string;
    avatar?: string;
    platform?: string;
    sentiment?: 'Positive' | 'Negative' | 'Neutral';
}

export interface CommunityNode {
    id: string;
    name: string;
    lat: number;
    lng: number;
    priority: number;
    issue: 'Water' | 'Roads' | 'Health' | 'Town Planning' | 'Structural';
    sentiment: number; // 0-100
    influencers: Influencer[];
    services: string[];
    strategy: string;
    news: string[];
    projectRisk?: number;
    isProjectSite?: boolean;
    municipality: string;
    province: string;
    leader: string;
}

export const communityData: CommunityNode[] = [
    {
        id: 'nelson-mandela-bay',
        name: 'Nelson Mandela Bay',
        municipality: 'NMA Metro',
        province: 'Eastern Cape',
        leader: 'Premier Oscar Mabuyane',
        lat: -33.9608,
        lng: 25.6022,
        priority: 98,
        issue: 'Water',
        sentiment: 18,
        influencers: [
            { name: 'Sizwe Ndlovu', role: 'Civil Rights Activist' },
            { name: 'Noluthando Dyani', role: 'Business Chamber Rep' }
        ],
        services: ['Desalination Plant Alpha', 'Drought Relief Vouchers'],
        strategy: 'Premier Mabuyane directive: Immediate escalation of water security infrastructure to mitigate Day Zero risk in the metro corridor.',
        news: ['Dam levels drop below 12%', 'New desalination pipeline enters final testing'],
        projectRisk: 42,
        isProjectSite: true
    },
    {
        id: 'buffalo-city',
        name: 'Buffalo City',
        municipality: 'BCM Metro',
        province: 'Eastern Cape',
        leader: 'Premier Oscar Mabuyane',
        lat: -32.9904,
        lng: 27.8733,
        priority: 85,
        issue: 'Town Planning',
        sentiment: 52,
        influencers: [
            { name: 'Luyolo Maziya', role: 'Port Authority Analyst' }
        ],
        services: ['Port Expansion Infrastructure', 'Urban Renewal Zone'],
        strategy: 'Coordination with Eastern Cape Infrastructure Dept for East London SEZ expansion.',
        news: ['Port of East London expects record traffic', 'Duncan Village upgrade Phase 2 approved'],
        isProjectSite: false
    },
    {
        id: 'nkangala',
        name: 'Nkangala District',
        municipality: 'Nkangala District',
        province: 'Mpumalanga',
        leader: 'Premier Mandla Ndlovu',
        lat: -25.7226,
        lng: 29.4589,
        priority: 91,
        issue: 'Roads',
        sentiment: 38,
        influencers: [
            { name: 'Mbuso Nkosi', role: 'Trucking Association Lead' }
        ],
        services: ['Haulage Road Hardening', 'Coal Corridor Maintenance'],
        strategy: 'Premier Ndlovu Priority: Critical maintenance of heavy-haulage logistics networks to support provincial energy production.',
        news: ['R40 maintenance backlogs addressed', 'New weighbridge tech deployed at Middelburg'],
        projectRisk: 15,
        isProjectSite: true
    },
    {
        id: 'sol-plaatje',
        name: 'Sol Plaatje',
        municipality: 'Kimberley Local',
        province: 'Northern Cape',
        leader: 'Premier Zamani Saul',
        lat: -28.7282,
        lng: 24.7499,
        priority: 89,
        issue: 'Structural',
        sentiment: 44,
        influencers: [
            { name: 'Adv. Piet Botha', role: 'Ratepayers Assoc' }
        ],
        services: ['Bulk Sewage Rehabilitation', 'Smart Grid Rollout'],
        strategy: 'Premier Zamani Saul "Modern & Green" mandate: High-tech infrastructure overhaul for Kimberley city center.',
        news: ['Night-time road repairs successful in CBD', 'Saul promises end to water leakages by Q4'],
        isProjectSite: true,
        projectRisk: 22
    },
    {
        id: 'city-of-cape-town',
        name: 'City of Cape Town',
        municipality: 'CCT Metro',
        province: 'Western Cape',
        leader: 'Premier Alan Winde',
        lat: -33.9249,
        lng: 18.4241,
        priority: 76,
        issue: 'Health',
        sentiment: 72,
        influencers: [
            { name: 'Helen Zille', role: 'Strategic Advisor' },
            { name: 'Michael Mpofu', role: 'Provincial Spokesperson' }
        ],
        services: ['Modular Clinic Nodes', 'Telehealth Infrastructure'],
        strategy: 'Premier Alan Winde Energy & Health Plan: Decoupling critical health nodes from the national grid via solar induction.',
        news: ['Tygerberg hospital upgrades hit 90% completion', 'New community health center opens in Delft'],
        isProjectSite: false
    },
    {
        id: 'saldanha-bay',
        name: 'Saldanha Bay',
        municipality: 'West Coast District',
        province: 'Western Cape',
        leader: 'Premier Alan Winde',
        lat: -32.9977,
        lng: 17.9458,
        priority: 82,
        issue: 'Town Planning',
        sentiment: 61,
        influencers: [
            { name: 'Erik Marais', role: 'IDZ Manager' }
        ],
        services: ['IDZ Logistic Interface', 'Industrial Water Recycling'],
        strategy: 'Focus on Saldanha Bay IDZ as a primary economic engine for the Western Cape coast.',
        news: ['Green Hydrogen project breaks ground', 'Municipal credit rating upgraded to A+'],
        isProjectSite: true,
        projectRisk: 8
    }
];
