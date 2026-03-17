import { tavily } from '@tavily/core';

/**
 * GIC Tavily Intelligence Client
 * Note: Use this client for real-time Signal discovery across South Africa, Lesotho, and Eswatini.
 */
export const tavilyClient = tavily({ 
    apiKey: "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" 
});

/**
 * Standard Intelligence Discovery Options
 */
export const searchOptions = {
    searchDepth: "advanced" as const,
    maxResults: 10,
    includeImages: true,
    includeAnswer: true
};
