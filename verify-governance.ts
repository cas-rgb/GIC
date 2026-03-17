import { getExecutiveNationalMetrics } from "./src/app/intel-actions";

async function verifyGovernance() {
    console.log("--- GOVERNANCE VERIFICATION ---");
    const result = await getExecutiveNationalMetrics();
    
    if (!result.success) {
        console.error("Metric fetch failed:", result.error);
        process.exit(1);
    }

    const { nationalConfidence } = result;

    console.log(`Metric: ${nationalConfidence.label}`);
    console.log(`Value: ${nationalConfidence.value}${nationalConfidence.unit}`);
    console.log(`Rating: ${nationalConfidence.rating}`);
    console.log(`Confidence: ${nationalConfidence.confidence}`);
    console.log(`Trace Count: ${nationalConfidence.trace.length}`);

    // Rule 1: No hardcoded 0.88-0.95 confidence
    if (nationalConfidence.confidence === 0.88 || nationalConfidence.confidence === 0.95) {
        console.error("FAIL: Hallucinated confidence score detected.");
        process.exit(1);
    }

    // Rule 2: Must have trace
    if (nationalConfidence.trace.length === 0) {
        console.error("FAIL: Missing data lineage trace.");
        process.exit(1);
    }

    console.log("--- VERIFICATION SUCCESSFUL ---");
}

verifyGovernance();
