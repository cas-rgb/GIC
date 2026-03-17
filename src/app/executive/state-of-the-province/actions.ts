"use server";

import { DashboardOnePipeline } from '@/services/dashboard-one-pipeline';

/**
 * Server Action to run the Dashboard 1 pipeline.
 * This ensures Node.js-specific modules (like 'net' in Tavily) 
 * remain on the server and do not leak into the client.
 */
export async function runDashboardOnePipeline(province: string) {
    console.log(`[SERVER ACTION] Running Dashboard One Pipeline for: ${province}`);
    try {
        await DashboardOnePipeline.runFullPipeline(province);
        return { success: true };
    } catch (error: any) {
        console.error(`[SERVER ACTION] Pipeline failed:`, error);
        throw new Error(error.message || "Failed to execute intelligence pipeline");
    }
}
