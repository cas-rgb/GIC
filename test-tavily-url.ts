
import { loadEnv } from "./scripts/load-env-cli";
loadEnv();

async function testTavily() {
    const { tavily: tavilySource } = await import("@tavily/core");
    const tavily = tavilySource({ apiKey: process.env.TAVILY_API_KEY || "" });

    const url = "https://www.gic.co.za/project/hlalanikahle-section-l/";
    
    console.log(`--- Testing Tavily for: ${url} ---`);

    try {
        // Test with the improved query (just the URL)
        console.log("Method 1: Querying with just the URL...");
        const search1 = await tavily.search(url, {
            searchDepth: "advanced",
            // @ts-ignore
            includeRawContent: true,
            maxResults: 1
        });
        console.log("Results 1 count:", search1.results.length);
        console.log("Raw Content 1 (first 100 chars):", search1.results[0]?.rawContent?.substring(0, 100) || "EMPTY");

        // Test with the original query (site: query)
        console.log("\nMethod 2: Querying with site:gic.co.za prefix...");
        const search2 = await tavily.search(`site:gic.co.za ${url}`, {
            searchDepth: "advanced",
            // @ts-ignore
            includeRawContent: true,
            maxResults: 1
        });
        console.log("Results 2 count:", search2.results.length);
        console.log("Raw Content 2 (first 100 chars):", search2.results[0]?.rawContent?.substring(0, 100) || "EMPTY");

    } catch (e) {
        console.error("Error testing Tavily:", e);
    }
}

testTavily();
