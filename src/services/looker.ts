import { google } from 'googleapis';

/**
 * Looker Studio Service Boilerplate
 * 
 * This service provides a foundation for interacting with the Looker Studio API.
 * Requirements:
 * 1. A Google Cloud Project with the Looker Studio API enabled.
 * 2. A Service Account with "Looker Studio Viewer" or "Owner" permissions.
 * 3. Service Account Key (JSON) stored in environment variables.
 */

const LOOKER_STUDIO_SCOPES = [
    'https://www.googleapis.com/auth/lookerstudio',
    'https://www.googleapis.com/auth/cloud-platform'
];

export class LookerService {
    private auth: any;

    constructor() {
        // Initializing using environment variables
        // Ensure GOOGLE_APPLICATION_CREDENTIALS points to your service account JSON file
        // Or GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY are set
        this.auth = new google.auth.GoogleAuth({
            scopes: LOOKER_STUDIO_SCOPES,
        });
    }

    /**
     * Retrieves metadata for a specific Looker Studio asset (Report/Data Source)
     * @param assetId The unique ID of the report or data source
     */
    async getAssetMetadata(assetId: string) {
        try {
            // Use any cast or specific lookerstudio access to bypass the TS callable error
            const lookerstudio: any = (google as any).lookerstudio({ version: 'v1', auth: this.auth });
            const response = await lookerstudio.assets.get({
                name: `assets/${assetId}`
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching Looker Studio asset:', error);
            throw error;
        }
    }

    /**
     * Lists assets available to the service account
     */
    async listAssets() {
        try {
            const lookerstudio: any = (google as any).lookerstudio({ version: 'v1', auth: this.auth });
            const response = await lookerstudio.assets.search({
                // Configuration for search query
            });
            return response.data;
        } catch (error) {
            console.error('Error listing Looker Studio assets:', error);
            throw error;
        }
    }

    /**
     * Generates a signed URL for embedding (Conceptual)
     * Note: Looker Studio primarily uses Google Workspace/Cloud Identity for permissions.
     * For programmatic embedding, ensure the report is shared with the service account.
     */
    generateEmbedUrl(reportId: string) {
        return `https://lookerstudio.google.com/embed/reporting/${reportId}/page/preview`;
    }
}

export const lookerService = new LookerService();
