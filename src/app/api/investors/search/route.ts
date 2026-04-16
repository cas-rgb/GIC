import { NextResponse } from "next/server";
import { searchCommunityData } from "@/services/tavily-service";
import { geminiPro, extractJsonArray } from "@/services/ai-service";

export const dynamic = "force-dynamic";

const mockInvestors = [
  {
    id: "inv-9",
    name: "Emerald Technology Ventures",
    focus: "Industrial Tech & Innovation",
    description: "Globally recognized venture capital firm based in Zurich specializing in industrial tech and sustainable innovation.",
    assets: "Over €1 billion",
    hq: "Zurich, Switzerland",
    sector: "green",
    region: "global",
    deepProfile: {
      website: "emerald-ventures.com",
      linkedin: "linkedin.com/company/emerald-technology-ventures",
      established: "2000",
      updated: "3/6/2026",
      teamSize: "50+",
      ticketSize: "€5 million to €10 million",
      narrativeSummary: "Emerald Technology Ventures is a globally recognized venture capital firm based in Zurich that specializes in industrial technology and sustainable innovation. Founded in 2000 by Gina Domanig, the firm has secured over €1 billion in commitments and operates offices in Zurich, Toronto, and Singapore. Emerald acts as a strategic innovation partner, connecting multinational corporations with high-potential startups to drive 'open innovation' in sectors such as energy, water, and mobility. They typically invest in early-stage and growth companies (Series A and B), with a sweet spot for primary investments ranging from €5 million to €10 million. With a global team of over 50 professionals, they manage several thematic funds and mandates for institutional, corporate, and government investors.",
      investmentPhilosophy: "Emerald focuses on 'open innovation,' acting as a bridge between corporate leaders and startups to accelerate the transition to a sustainable industrial future. They prioritize sectors where technical depth and global corporate networks can significantly de-risk and scale innovation.",
      investmentStages: ["Early Stage", "Series A", "Series B", "Growth"],
      industryFocus: ["Energy", "Water", "Industrial IT", "Advanced Materials", "Mobility", "Robotics", "Agriculture", "Sustainable Packaging"],
      portfolioExamples: ["Librestream", "Sophia Genetics", "Next Kraftwerke", "Urgently", "FREDsense"],
      contact: {
        phone: "+41 44 269 61 00",
        email: "info@emerald-ventures.com",
        address: "Seefeldstrasse 215, 8008 Zurich, Switzerland"
      },
      reachOutStrategy: [
        "Propose localized pilot opportunities for their water tech portfolio within targeted municipal grids.",
        "Highlight GIC's pipeline of sustainable packaging transition requirements for major SOEs.",
        "Request exploratory dialogue on co-funding early-stage African mobility innovation."
      ],
      investmentFocus: {
        sweetSpot: "€5 million to €20 million"
      },
      keyPersonnel: [
        { initial: "G", name: "Gina Domanig", role: "Managing Partner" },
        { initial: "H", name: "Hans Dellenbach", role: "CFO" },
        { initial: "M", name: "Markus Moor", role: "Managing Partner" },
        { initial: "C", name: "Charles Vaslet", role: "Senior Partner" }
      ]
    }
  },
  {
    id: "inv-1",
    name: "Development Bank of Southern Africa (DBSA)",
    focus: "Sovereign & Municipal Infrastructure",
    description: "Primary state-owned development finance institution focusing on large-scale civil, water, and energy infrastructure.",
    assets: "R100B+ ZAR",
    hq: "Midrand, ZA",
    sector: "civil",
    region: "za",
    deepProfile: {
      website: "dbsa.org",
      linkedin: "linkedin.com/company/dbsa",
      established: "1983",
      updated: "3/15/2026",
      teamSize: "500+",
      ticketSize: "R250m to R5B+",
      narrativeSummary: "The Development Bank of Southern Africa (DBSA) is one of the leading Development Finance Institutions (DFIs) in Africa. Wholly owned by the South African government, the DBSA plays a pivotal role in delivering developmental infrastructure across the continent. Its primary focus is on large-scale civic projects, specifically in the water, energy, and transport sectors. The DBSA not only provides capital but also project preparation and advisory services to municipalities facing critical delivery backlogs.",
      investmentPhilosophy: "To advance the development impact in the region by expanding access to development finance and effectively integrating and implementing sustainable, catalytic infrastructure solutions.",
      investmentStages: ["Project Preparation", "Early Stage Construction", "Growth/Refinancing"],
      industryFocus: ["Water & Sanitation", "Energy Infrastructure", "Mass Transport", "ICT"],
      portfolioExamples: ["REIPPPP Solar Integration", "Metropolitan Water Treatment Upgrades", "Tshwane Bus Rapid Transit"],
      contact: {
        phone: "+27 11 313 3911",
        email: "webmaster@dbsa.org",
        address: "1258 Lever Rd, Headway Hill, Midrand, 1685"
      },
      reachOutStrategy: [
        "Align pitch directly with their Project Preparation Facility for derisking GIC's early-stage civil proposals.",
        "Emphasize the socio-economic alignment of GIC's water and mass transport pipeline.",
        "Position GIC as the definitive implementation partner for unblocking stalled municipal mega-projects."
      ],
      investmentFocus: {
        sweetSpot: "R250m to R5B+"
      },
      keyPersonnel: [
        { initial: "B", name: "Boitumelo Mosako", role: "Chief Executive Officer" },
        { initial: "Z", name: "Zodwa Mbele", role: "Group Executive: Transacting" },
        { initial: "M", name: "Mpho Brown", role: "Head of Infrastructure Delivery" }
      ]
    }
  },
  {
    id: "inv-2",
    name: "African Infrastructure Investment Managers (AIIM)",
    focus: "Private Equity Infrastructure",
    description: "Leading private sector infrastructure manager investing across toll roads, renewable energy, and digital infrastructure.",
    assets: "$2.8B USD",
    hq: "Cape Town, ZA",
    sector: "civil",
    region: "ss",
    deepProfile: {
      website: "aiimafrica.com",
      linkedin: "linkedin.com/company/aiimafrica",
      established: "2000",
      updated: "2/10/2026",
      teamSize: "100+",
      ticketSize: "$20m to $150m",
      narrativeSummary: "African Infrastructure Investment Managers (AIIM) is one of the largest and most experienced private equity infrastructure investment managers on the continent. With over $2.8 billion under management, they focus on toll roads, renewable energy, and digital infrastructure across multiple African jurisdictions. They have executed over 60 investments and boast a deep local footprint, acting as the primary bridge between international capital and structural African development.",
      investmentPhilosophy: "AIIM develops and manages private equity infrastructure funds designed to invest directly into sustainable infrastructure assets that provide essential services to expanding urban populations.",
      investmentStages: ["Growth", "Late Stage PE", "Buyout"],
      industryFocus: ["Toll Roads", "Renewable Energy", "Digital Infrastructure", "Midstream Energy"],
      portfolioExamples: ["Bakwena Toll Road", "Cookhouse Wind Farm", "MetroFibre Networx", "Starsight Energy"],
      contact: {
        phone: "+27 21 670 1234",
        email: "info@aiimafrica.com",
        address: "The Citadel, 15 Cavendish Street, Claremont, Cape Town"
      },
      reachOutStrategy: [
        "Introduce shovel-ready toll-road expansions requiring massive private equity interventions.",
        "Present GIC's high-yield digital infrastructure pipeline targeting underserved metros.",
        "Demonstrate robust projected ROI metrics directly to their Co-Managing Directors."
      ],
      investmentFocus: {
        sweetSpot: "$20m to $150m"
      },
      keyPersonnel: [
        { initial: "O", name: "Olusola Lawson", role: "Co-Managing Director" },
        { initial: "V", name: "Vuyo Ntoi", role: "Co-Managing Director" },
        { initial: "E", name: "Ed Stumpf", role: "Investment Director" }
      ]
    }
  },
  {
    id: "inv-3",
    name: "Public Investment Corporation (PIC)",
    focus: "Sovereign Pension Capital",
    description: "Africa's largest asset manager with a dedicated developmental investment mandate focusing on economic and social infrastructure.",
    assets: "R2.6T ZAR",
    hq: "Pretoria, ZA",
    sector: "civil",
    region: "za",
    deepProfile: {
      website: "pic.gov.za",
      linkedin: "linkedin.com/company/public-investment-corporation",
      established: "1911",
      updated: "1/20/2026",
      teamSize: "400+",
      ticketSize: "R500m to R10B+",
      narrativeSummary: "The Public Investment Corporation handles the Government Employees Pension Fund (GEPF) and is the absolute largest asset manager in Africa, commanding over R2.6 Trillion. Beyond traditional equities, they maintain a massive unlisted and developmental mandate, deploying capital deep into social and economic infrastructure to drive structural transformation in South Africa. The PIC is capable of single-handedly anchoring major civic and utility expansions.",
      investmentPhilosophy: "To exceed client expectations by investing in projects that generate robust financial returns while simultaneously driving targeted socio-economic developmental impact in South Africa.",
      investmentStages: ["Growth", "Mezzanine Debt", "Late Stage Equity", "Sovereign Bonds"],
      industryFocus: ["Economic Infrastructure", "Social Infrastructure", "Renewables", "Affordable Housing"],
      portfolioExamples: ["Airports Company South Africa (ACSA)", "Transnet Port Expansion", "Various REIPPPP Solar Plants"],
      contact: {
        phone: "+27 12 742 3400",
        email: "info@pic.gov.za",
        address: "Menlyn Maine Central Square, Corner Aramist Avenue, Pretoria"
      },
      reachOutStrategy: [
        "Submit large-scale aggregated sovereign-level debt frameworks to their Unlisted Investments wing.",
        "Highlight explicit job creation and B-BBEE metrics in every social infrastructure proposal.",
        "Approach the PIC only once projects have surpassed the R500m threshold and have clear ESG compliance."
      ],
      investmentFocus: {
        sweetSpot: "R500m to R10B+"
      },
      keyPersonnel: [
        { initial: "A", name: "Abel Sithole", role: "Chief Executive Officer" },
        { initial: "L", name: "Lusanda Gugwana", role: "Head of Unlisted Investments" },
        { initial: "S", name: "Sholto Roussos", role: "Head of Developmental Impact" }
      ]
    }
  },
  {
    id: "inv-4",
    name: "Harith General Partners",
    focus: "Pan-African Infrastructure",
    description: "Specialized fund managers targeting deep developmental impact in transport, energy, and water sectors.",
    assets: "$1.2B USD",
    hq: "Sandton, ZA",
    sector: "civil",
    region: "ss",
    deepProfile: {
      website: "harith.co.za",
      linkedin: "linkedin.com/company/harith-general-partners",
      established: "2007",
      updated: "3/01/2026",
      teamSize: "50+",
      ticketSize: "$30m to $200m",
      narrativeSummary: "Harith General Partners is an undisputed heavyweight of African infrastructure investing. Born out of the vision to close the continent's infrastructure deficit, they manage the Pan-African Infrastructure Development Fund (PAIDF). They focus strictly on highly complex, capital-intensive deployments in transport nodes, massive energy grids, and water structuring. Harith blends deep political navigation with top-tier private equity execution.",
      investmentPhilosophy: "Unlocking scale in African infrastructure. We invest where the capital deficit meets systemic economic necessity, securing long-term yield through rigorous execution capability.",
      investmentStages: ["Growth Equity", "Greenfield Development", "Brownfield Expansion"],
      industryFocus: ["Transport & Logistics", "Energy Generation", "Water Utilities", "Telecoms"],
      portfolioExamples: ["Lanseria International Airport", "Lake Turkana Wind Power", "Gautrain Rapid Rail Link"],
      contact: {
        phone: "+27 11 384 4000",
        email: "contact@harith.co.za",
        address: "34A Fredman Drive, Sandton, Johannesburg, 2196"
      },
      reachOutStrategy: [
        "Leverage high-level strategic alignment with PAIDF mandate for cross-border logistics hubs.",
        "Propose co-investment in massive, multi-decade transport and energy concessions.",
        "Focus on delivering strictly commercial returns blended with political derisking."
      ],
      investmentFocus: {
        sweetSpot: "$30m to $200m"
      },
      keyPersonnel: [
        { initial: "S", name: "Sipho Makhubela", role: "Chief Executive Officer" },
        { initial: "T", name: "Tshepo Mahloele", role: "Chairman & Founder" },
        { initial: "E", name: "Emile Du Toit", role: "Head of Infrastructure Deals" }
      ]
    }
  },
  {
    id: "inv-5",
    name: "Stanlib Infrastructure Fund",
    focus: "Renewable & Alternative Energy",
    description: "Significant capital deployer in the REIPPPP (Renewable Energy Independent Power Producer Procurement Programme).",
    assets: "R9B ZAR",
    hq: "Johannesburg, ZA",
    sector: "green",
    region: "za",
    deepProfile: {
      website: "stanlib.com/infrastructure",
      linkedin: "linkedin.com/company/stanlib",
      established: "2002",
      updated: "2/28/2026",
      teamSize: "200+",
      ticketSize: "R100m to R1B",
      narrativeSummary: "Stanlib is a premier South African asset manager with a robust dedicated infrastructure franchise. Their Infrastructure and Private Equity wings are major players in the REIPPPP, funneling deep institutional liquidity directly into critical renewable energy IPPs. They exist to stabilize the national grid while driving the South African green transition, heavily favoring projects that merge high ESG compliance with immediate municipal relief.",
      investmentPhilosophy: "Harnessing deep institutional liquidity to fund the physical transition of the South African economy, optimizing for defensive, inflation-linked yields.",
      investmentStages: ["Project Finance", "Growth PE", "Late Stage Infrastructure"],
      industryFocus: ["Utility-scale Solar", "Wind Generation", "Peaking Power", "Municipal Grids"],
      portfolioExamples: ["Kalkbult Solar Power", "Dreunberg Solar", "Various ESG Corporate Debt facilities"],
      contact: {
        phone: "+27 11 448 6000",
        email: "infrastructure@stanlib.com",
        address: "17 Melrose Boulevard, Melrose Arch, Johannesburg"
      },
      reachOutStrategy: [
        "Pitch fully vetted, license-approved IPP solar and wind projects seeking senior debt.",
        "Present localized municipal grid interventions targeting severe, immediate power shortages.",
        "Ensure all GIC pitch decks highlight absolute defensive, inflation-linked yield characteristics."
      ],
      investmentFocus: {
        sweetSpot: "R100m to R1B"
      },
      keyPersonnel: [
        { initial: "G", name: "Greg Babaya", role: "Head of Infrastructure" },
        { initial: "A", name: "Alethea Nkomo", role: "Lead Energy Analyst" }
      ]
    }
  },
  {
    id: "inv-6",
    name: "Sanlam InfraWorks",
    focus: "Climate Finance & Green Energy",
    description: "Focuses on climate impact, ESG-compliant green energy retrofitting, and sustainable municipal grids.",
    assets: "$500M USD",
    hq: "Bellville, ZA",
    sector: "green",
    region: "global",
    deepProfile: {
      website: "sanlam.com/investments",
      linkedin: "linkedin.com/company/sanlam-investments",
      established: "2017",
      updated: "1/15/2026",
      teamSize: "80+",
      ticketSize: "$10m to $50m",
      narrativeSummary: "Sanlam InfraWorks operates as an agile, highly specialized infrastructure division within the broader Sanlam Group. Emerging over the last decade, their focus has aggressively pivoted toward ESG-compliant capital allocation. They act as a primary institutional catalyst for climate finance, large-scale green energy retrofitting in industrial complexes, and massive public-sector climate resiliency upgrades facing systemic weather risks.",
      investmentPhilosophy: "Merging fiduciary responsibility with acute climate action by driving capital directly into resilient, forward-looking sustainable infrastructure.",
      investmentStages: ["Series B", "Growth", "Project Finance"],
      industryFocus: ["Climate Resiliency", "Green Retrofits", "Waste-to-Energy", "Energy Storage"],
      portfolioExamples: ["Cape Town Water Resiliency Framework", "Gauteng Solar Micro-grids", "Industrial Retrofit Fund"],
      contact: {
        phone: "+27 21 947 9111",
        email: "infraworks@sanlaminvestments.com",
        address: "2 Strand Road, Bellville, Cape Town, 7530"
      },
      reachOutStrategy: [
        "Target their ESG auditing team with GIC's pipeline of climate resiliency and retrofitting projects.",
        "Frame capital requests around 'climate impact' metrics rather than purely commercial hurdles.",
        "Propose joint ventures on high-visibility waste-to-energy municipal projects."
      ],
      investmentFocus: {
        sweetSpot: "$10m to $50m"
      },
      keyPersonnel: [
        { initial: "T", name: "Tavonga Chikava", role: "Director of InfraWorks" },
        { initial: "M", name: "Mia Van Der Merwe", role: "ESG Lead Auditor" }
      ]
    }
  },
  {
    id: "inv-7",
    name: "Vantage Capital",
    focus: "Mezzanine Debt",
    description: "Provides specialized mezzanine debt structuring for commercial property and mid-tier civic expansions.",
    assets: "R15B ZAR",
    hq: "Johannesburg, ZA",
    sector: "property",
    region: "ss",
    deepProfile: {
      website: "vantagecapital.co.za",
      linkedin: "linkedin.com/company/vantage-capital-group",
      established: "2001",
      updated: "3/10/2026",
      teamSize: "35+",
      ticketSize: "R150m to R450m",
      narrativeSummary: "Vantage Capital is Africa's largest independent mezzanine debt fund manager. While traditional banks offer senior debt and private equity firms take primary ownership, Vantage provides highly specialized mezzanine structuring. This allows corporate property developers and operators of mid-tier civic expansion nodes to secure critical growth capital while heavily mitigating equity dilution. They are a crucial capital lever in complex municipal PPP structures.",
      investmentPhilosophy: "Providing flexible, non-dilutive growth capital to the rising champions of the African commercial and infrastructural landscape.",
      investmentStages: ["Expansion Capital", "Mezzanine Refinancing", "MBOs"],
      industryFocus: ["Commercial Property", "Mid-tier Civil Expansions", "Healthcare Infra", "Education"],
      portfolioExamples: ["New GX Capital", "Vumatel (Early stage debt)", "Various Mid-market Healthcare hubs"],
      contact: {
        phone: "+27 11 530 9100",
        email: "info@vantagecapital.co.za",
        address: "Third Floor, 10 The High Street, Melrose Arch, Johannesburg"
      },
      reachOutStrategy: [
        "Introduce Vantage to established property operators needing non-dilutive expansion capital.",
        "Leverage their mezzanine agility for fast-moving commercial property opportunities lacking tier-1 equity.",
        "Target the Managing Partners directly with structured, cash-flow producing civic hubs."
      ],
      investmentFocus: {
        sweetSpot: "R150m to R450m"
      },
      keyPersonnel: [
        { initial: "W", name: "Warren van der Merwe", role: "Managing Partner" },
        { initial: "L", name: "Luc Albinski", role: "Managing Partner" },
        { initial: "M", name: "Mokgome Mogoba", role: "Associate Partner" }
      ]
    }
  },
  {
    id: "inv-8",
    name: "Old Mutual Alternative Investments",
    focus: "Housing & Commercial Property",
    description: "Major deployer in affordable housing, student accommodation, and commercial nodes in developing municipalities.",
    assets: "R80B ZAR",
    hq: "Cape Town, ZA",
    sector: "property",
    region: "za",
    deepProfile: {
      website: "oldmutualalternatives.com",
      linkedin: "linkedin.com/company/old-mutual-alternative-investments",
      established: "2004",
      updated: "2/20/2026",
      teamSize: "150+",
      ticketSize: "R200m to R2B+",
      narrativeSummary: "Old Mutual Alternative Investments (OMAI) manages over R80 billion across various alternative asset classes. Their infrastructure and property development arms are absolute powerhouse engines for spatial transformation in South Africa. They deploy aggressively into affordable housing delivery, massive student accommodation rollouts near tier-1 universities, and the stabilization of commercial property nodes functioning as municipal economic anchors.",
      investmentPhilosophy: "Generating sustainable long-term returns through actively managed, diversified alternative asset portfolios that trigger massive spatial and economic relief.",
      investmentStages: ["Asset Rollout", "Greenfield Property", "Large Scale Expansion"],
      industryFocus: ["Affordable Housing", "Student Accommodation", "Retail Nodes in emerging geos", "Logistics"],
      portfolioExamples: ["Housing Impact Fund", "Respublica Student Accommodation", "Vukile Property Transfers"],
      contact: {
        phone: "+27 21 530 9500",
        email: "alternatives@oldmutual.com",
        address: "Mutualpark, Jan Smuts Drive, Pinelands, Cape Town"
      },
      reachOutStrategy: [
        "Present highly-scaleable affordable housing and student accommodation land parcels.",
        "Emphasize the spatial spatial transformation and massive social yield achieved by GIC projects.",
        "Align all commercial node pitches with their mandate to anchor emerging municipalities economically."
      ],
      investmentFocus: {
        sweetSpot: "R200m to R2B+"
      },
      keyPersonnel: [
        { initial: "P", name: "Paul Boynton", role: "Chief Executive Officer" },
        { initial: "N", name: "Niyi Adepegba", role: "Head of Infrastructure" },
        { initial: "S", name: "Sisa Maguga", role: "Housing Fund Manager" }
      ]
    }
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const sector = searchParams.get("sector") || "all";
  const region = searchParams.get("region") || "all";

  // 1. Initial State: Return standard registry if no query is actively searched
  if (!q) {
    let results = mockInvestors;
    if (sector !== "all") {
      results = results.filter(i => i.sector === sector);
    }
    if (region !== "all") {
      results = results.filter(i => i.region === region);
    }
    return NextResponse.json({ investors: results });
  }

  // 2. ACTIVE OSINT EXTRACTION PIPELINE
  try {
    const searchQuery = `Find comprehensive private equity, venture capital, and institutional investors matching: ${q}. Focus on ${sector !== "all" ? sector : "infrastructure"} sector in ${region !== "all" ? region : "Africa or Global"}. Find recent AUM, ticket size, key personnel, investment philosophy, and website URL.`;
    
    const tavilyResults = await searchCommunityData(searchQuery);
    
    if (!tavilyResults || !tavilyResults.results) {
      throw new Error("Tavily API returned null context.");
    }
    
    const searchContext = tavilyResults.results.map((r: any) => `${r.title}\n${r.content}`).join("\n\n");

    const prompt = `
      You are an elite infrastructure intelligence analyst. Analyze the following live web search results about investors and institutional capital providers.
      
      SEARCH CONTEXT:
      ${searchContext}

      Create a structured JSON array of 1 to 5 highly relevant corporate investors matching the user's intent: "${q}".
      
      You MUST strictly return ONLY a JSON array matching this exact TypeScript interface:
      [{
        "id": "generate-a-unique-uuid-string",
        "name": "Exact Firm Name",
        "focus": "Short 3-5 word mandate (e.g. Green Energy Equity)",
        "description": "2-3 sentence summary of their operations.",
        "assets": "AUM (e.g. R15B ZAR or $2B USD)",
        "hq": "City, Country",
        "sector": "civil" or "green" or "property",
        "region": "za" or "ss" or "global",
        "deepProfile": {
          "website": "example.com",
          "established": "Year format like '2005' if available",
          "teamSize": "e.g. 50+ or 150+",
          "ticketSize": "e.g. $5m - $20m",
          "narrativeSummary": "A longer, comprehensive 4-sentence deep dive into their strategy and history globally.",
          "investmentPhilosophy": "A defining quote or core philosophy regarding their capital allocation.",
          "investmentStages": ["Seed", "Series A", "Growth"],
          "industryFocus": ["Water", "Energy", "Transport"],
          "portfolioExamples": ["Company A", "Company B"],
          "contact": { "phone": "+44 20...", "email": "info@...", "address": "Detailed HQ address" },
          "reachOutStrategy": ["Actionable strategy point 1", "Actionable strategy point 2", "Actionable strategy point 3"],
          "keyPersonnel": [
            { "initial": "A", "name": "John Doe", "role": "Managing Partner" }
          ]
        }
      }]
      
      Only output valid JSON format. Do not use block quote markers outside of the array. Synthesize the 'deepProfile' realistically and accurately using the context. If data is sparse, deduce the most likely realistic corporate framework. Provide a realistic 3-point 'reachOutStrategy' customized for the GIC infrastructure mandate to appeal to this investor.
    `;

    const aiResponse = await geminiPro.generateContent(prompt);
    const parsedText = aiResponse.response.text();
    const generatedInvestors = extractJsonArray(parsedText);

    if (generatedInvestors.length === 0) {
      console.warn("AI returned empty array, falling back to local registry filter.");
      let results = mockInvestors.filter(i => 
        i.name.toLowerCase().includes(q.toLowerCase()) || 
        i.description.toLowerCase().includes(q.toLowerCase())
      );
      return NextResponse.json({ investors: results });
    }

    return NextResponse.json({ investors: generatedInvestors });

  } catch (error) {
    console.error("OSINT Pipeline Error:", error);
    let results = mockInvestors.filter(i => 
      i.name.toLowerCase().includes(q.toLowerCase()) || 
      i.description.toLowerCase().includes(q.toLowerCase())
    );
    return NextResponse.json({ investors: results });
  }
}
