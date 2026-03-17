const { tavily } = require("@tavily/core");
const fs = require("fs");
const path = require("path");

// Environment Setup
const envPath = path.resolve(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach(line => {
    const [key, value] = line.split("=");
    if (key && value) {
        env[key.trim()] = value.trim().replace(/"/g, "");
    }
});

const tClient = tavily({ apiKey: env.NEXT_PUBLIC_TAVILY_API_KEY });

// Target Communities
const targetCommunities = [
    { name: "Nelson Mandela Bay", muni: "NMA Metro", prov: "Eastern Cape" },
    { name: "Buffalo City", muni: "BCM Metro", prov: "Eastern Cape" },
    { name: "Nkangala District", muni: "Nkangala District", prov: "Mpumalanga" },
    { name: "Sol Plaatje", muni: "Kimberley Local", prov: "Northern Cape" },
    { name: "City of Cape Town", muni: "CCT Metro", prov: "Western Cape" },
    { name: "Saldanha Bay", muni: "West Coast District", prov: "Western Cape" }
];

const serviceLines = ["Water/Sewerage", "Roads", "Health", "Town Planning", "Structural"];

const getCoreQueries = (community, muni) => [
    `("${community}" OR "${muni}") AND (water OR sewerage OR sewage OR "burst pipe" OR "water outage" OR "no water" OR sanitation OR potholes OR roads OR clinic OR hospital OR housing OR structural)`,
    `("${community}" OR "${muni}") AND ("service delivery" OR "service-delivery" OR "community protest" OR protest OR march OR shutdown OR unrest)`,
    `("${community}") AND (today OR this week OR "last night" OR yesterday) AND (water OR sewage OR potholes OR protest OR clinic)`
];

const getServiceQueries = (community, muni, service) => {
    switch (service) {
        case "Water/Sewerage":
            return [
                `("${community}" OR "${muni}") AND ("no water" OR "water outage" OR "water supply" OR "water cuts" OR "water tanker")`,
                `("${community}" OR "${muni}") AND (sewerage OR sewage OR sanitation OR "sewage spill" OR "blocked drain")`
            ];
        case "Roads":
            return [
                `("${community}" OR "${muni}") AND (pothole OR potholes OR "road damage" OR "road collapse" OR sinkhole)`,
                `("${community}" OR "${muni}") AND ("roadworks" OR "road maintenance" OR resurfacing OR detour)`
            ];
        case "Health":
            return [
                `("${community}" OR "${muni}") AND (clinic OR hospital OR "health facility" OR "mobile clinic")`,
                `("${community}" OR "${muni}") AND ("medicine shortage" OR "staff shortage" OR overcrowding)`
            ];
        case "Town Planning":
            return [
                `("${community}" OR "${muni}") AND ("town planning" OR rezoning OR zoning OR "land use")`,
                `("${community}" OR "${muni}") AND ("informal settlement" OR "land invasion" OR "illegal occupation")`
            ];
        case "Structural":
            return [
                `("${community}" OR "${muni}") AND ("structural" OR "structural damage" OR "building collapse" OR "unsafe building")`,
                `("${community}" OR "${muni}") AND ("community hall" OR "school building" OR "facility upgrade")`
            ];
        default: return [];
    }
};

const getSocialConstraint = () => "(site:twitter.com OR site:instagram.com OR site:tiktok.com OR site:linkedin.com OR site:facebook.com)";

const rawResults = [];

async function ingest() {
    console.log("Starting Raw Tavily Harvesting...");

    for (const comm of targetCommunities) {
        let commResults = [];
        console.log(`\nHarvesting: ${comm.name}`);

        const queries = [
            ...getCoreQueries(comm.name, comm.muni).map(q => ({ q: `${q} ${getSocialConstraint()}`, t: "Social" })),
            ...serviceLines.flatMap(s => getServiceQueries(comm.name, comm.muni, s).map(q => ({ q, t: `Service: ${s}` })))
        ];

        for (const item of queries) {
            console.log(`Query: ${item.q.substring(0, 50)}... [${item.t}]`);
            try {
                const res = await tClient.search(item.q, { searchDepth: "advanced", maxResults: 20 });
                if (res.results) {
                    const normalized = res.results.map(r => ({
                        url: r.url,
                        title: r.title,
                        content: r.content,
                        type: item.t,
                        community: comm.name,
                        province: comm.prov
                    }));
                    rawResults.push(...normalized);
                    console.log(`Captured ${normalized.length} results. Total: ${rawResults.length}`);
                }
            } catch (err) {
                console.error("Query Error:", err.message);
            }
            await new Promise(r => setTimeout(r, 1000));
        }

        // Final Stakeholders check
        const stakeQuery = `("${comm.name}" OR "${comm.muni}") AND ("ward councillor" OR NGO OR "residents association" OR journalist)`;
        const sRes = await tClient.search(stakeQuery, { searchDepth: "advanced", maxResults: 20 });
        if (sRes.results) {
            rawResults.push(...sRes.results.map(r => ({ ...r, type: "Stakeholder", community: comm.name, province: comm.prov })));
        }

        if (rawResults.length > 2000) break;
    }

    fs.writeFileSync("raw_osint_data.json", JSON.stringify(rawResults, null, 2));
    console.log(`\nHarvesting Complete. ${rawResults.length} raw records saved to raw_osint_data.json`);
    process.exit(0);
}

ingest();
