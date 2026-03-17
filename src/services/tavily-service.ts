import { tavily } from '@tavily/core';

const apiKey = process.env.TAVILY_API_KEY || "";
const client = tavily({ apiKey });

export async function searchCommunityData(query: string) {
    try {
        const results = await client.search(query, {
            includeAnswer: "advanced",
            searchDepth: "advanced",
            maxResults: 10
        });
        return results;
    } catch (error) {
        console.error("Tavily Search Error:", error);
        return null;
    }
}

export async function crawlCommunitySite(url: string) {
    try {
        const results = await client.crawl(url, {
            extractDepth: "advanced"
        });
        return results;
    } catch (error) {
        console.error("Tavily Crawl Error:", error);
        return null;
    }
}
export async function extractData(urls: string[]) {
    try {
        const results = await (client as any).extract(urls);
        return results;
    } catch (error) {
        console.error("Tavily Extract Error:", error);
        return null;
    }
}

export async function deepResearch(query: string) {
    try {
        const results = await client.search(query, {
            searchDepth: "advanced",
            includeAnswer: "advanced",
            maxResults: 20
        });
        return results;
    } catch (error) {
        console.error("Tavily Deep Research Error:", error);
        return null;
    }
}

export async function searchLocalMedia(location: string) {
    const query = `${location} "local news" OR "community radio" OR "regional newspaper" infrastructure service delivery`;
    return await searchCommunityData(query);
}

export async function searchProvincialDynamics(province: string, premier: string) {
    const query = `${province} Premier ${premier} strategic updates infrastructure projects sentiment`;
    return await searchCommunityData(query);
}
