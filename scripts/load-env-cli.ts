import * as fs from "fs";
import * as path from "path";

/**
 * Robust environment loader for CLI scripts.
 * Handles Windows \r\n, stripped quotes, and comments.
 */
export function loadEnv() {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (!fs.existsSync(envPath)) {
        console.warn("⚠️  .env.local not found at", envPath);
        return false;
    }

    const content = fs.readFileSync(envPath, "utf-8");
    content.split("\n").forEach(line => {
        // Remove \r and trim whitespace
        const trimmed = line.replace(/\r/g, '').trim();
        
        // Skip empty lines and comments
        if (!trimmed || trimmed.startsWith("#")) return;
        
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
            let value = valueParts.join("=").trim();
            
            // Strip quotes
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            
            process.env[key.trim()] = value;
        }
    });

    return true;
}
