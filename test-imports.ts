import * as path from "path";
import * as fs from "fs";

async function testImports() {
    console.log("Testing path resolution...");
    console.log("CWD:", process.cwd());
    
    try {
        console.log("Attempting to import GlobalDataOrchestrator...");
        // Use relative path for testing
        const orchestratorPath = path.resolve(process.cwd(), "src/services/data-orchestrator.ts");
        console.log("Resolution Path:", orchestratorPath);
        console.log("File Exists:", fs.existsSync(orchestratorPath));
        
        const { GlobalDataOrchestrator } = await import("./src/services/data-orchestrator");
        console.log("Import Success: GlobalDataOrchestrator is defined:", !!GlobalDataOrchestrator);
    } catch (e: any) {
        console.error("Import Failed:", e.message);
        if (e.stack) console.error(e.stack);
    }
}

testImports();
