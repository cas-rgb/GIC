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
    { name: "Nelson Mandela Bay", muni: "NMA Metro" },
    { name: "Buffalo City", muni: "BCM Metro" },
    { name: "Nkangala District", muni: "Nkangala District" },
    { name: "Sol Plaatje", muni: "Kimberley Local" },
    { name: "City of Cape Town", muni: "CCT Metro" },
    { name: "Saldanha Bay", muni: "West Coast District" }
];

// Expanded Citizen Phrasing
const citizenPhases = [
    "I have no", "my street", "our area", "waiting at", "frustrated with", "still no",
    "does anyone know", "since this morning", "broken again", "no water in my",
    "pothole outside my", "been waiting for weeks", "municipality failed us",
    "service delivery is a joke", "literally no water", "our community is tired",
    "report a leak near", "power out for hours", "the smell is", "so angry that"
];

const getSocialConstraint = () => "(site:twitter.com OR site:x.com OR site:instagram.com OR site:facebook.com OR site:tiktok.com OR site:linkedin.com OR site:threads.net)";

const citizenResults = [];

async function harvestCitizens() {
    console.log("Starting Expanded Citizen-Only Social Media Harvesting...");

    for (const comm of targetCommunities) {
        console.log(`\n--- Harvesting Citizen Voices: ${comm.name} ---`);

        for (const phrase of citizenPhases) {
            const query = `("${comm.name}" OR "${comm.muni}") AND "${phrase}" ${getSocialConstraint()}`;
            console.log(`Query: ${query.substring(0, 60)}...`);

            try {
                const res = await tClient.search(query, {
                    searchDepth: "advanced",
                    maxResults: 60,
                    timeRange: "month"
                });

                if (res.results) {
                    const normalized = res.results.map(r => ({
                        url: r.url,
                        title: r.title,
                        content: r.content,
                        type: "social-citizen",
                        community: comm.name,
                        source_type: "social",
                        detected_location: comm.name
                    }));
                    citizenResults.push(...normalized);
                    console.log(`Captured ${normalized.length} potential signals. Total: ${citizenResults.length}`);
                }
            } catch (err) {
                console.error("Query Error:", err.message);
            }

            if (citizenResults.length >= 2500) break;
            await new Promise(r => setTimeout(r, 1000));
        }
        if (citizenResults.length >= 2500) break;
    }

    fs.writeFileSync("citizen_social_raw.json", JSON.stringify(citizenResults, null, 2));
    console.log(`\nExpanded Harvesting Complete. ${citizenResults.length} records saved.`);
    process.exit(0);
}

harvestCitizens();
