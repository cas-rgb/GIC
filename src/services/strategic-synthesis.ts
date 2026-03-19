"use server";

import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { geminiPro, extractJsonObject } from "./ai-service";
import { StrategicReasoning } from "@/types";
import { CommunitySignal } from "@/types/database";

export async function generateLiveStrategicReasoning(): Promise<StrategicReasoning | null> {
  console.log("Synthesizing National Strategic Intelligence...");

  try {
    // 1. Fetch live signals from Firestore
    const signalsRef = collection(db, "communitySignals");
    const q = query(signalsRef, orderBy("createdAt", "desc"), limit(15));
    const querySnapshot = await getDocs(q);

    const signals: CommunitySignal[] = [];
    querySnapshot.forEach((doc) => {
      signals.push(doc.data() as CommunitySignal);
    });

    if (signals.length === 0) {
      console.log("No live signals found, falling back to basic context.");
    }

    const signalContext = signals
      .map(
        (s) =>
          `- ${s.category} [${s.urgency}/5]: ${s.text} (Source: ${s.source})`,
      )
      .join("\n");

    // 2. Build the Strategic Reasoning Prompt
    const prompt = `
            You are the GIC (Gauteng Infrastructure Company) Apex Reasoner.
            Your task is to synthesize the following real-time infrastructure signals into a "Strategic Reasoning Chain".
            
            REAL-TIME SIGNALS:
            ${signalContext || "Baseline monitoring active. No major disruptions reported."}

            OBJECTIVE:
            Analyze cross-sector convergence (e.g., how water outages affect health, or how road protests disrupt planning).
            Identify a "Primary Node" of concern or growth.
            Calculate "Logic Strength" (0-1) based on data density and reliability.
            Provide 3 logical steps showing the transformation from raw signals to strategic impact.
            Provide 3 grounding data points (Summary metrics).

            OUTPUT FORMAT (JSON ONLY):
            {
                "primaryNode": "Name of the key community or sector",
                "logicStrength": 0.95,
                "reasoningSteps": [
                    { "id": "s1", "title": "Step Title", "description": "Logical analysis", "impact": "Strategic Impact" },
                    { "id": "s2", "title": "Step Title", "description": "Logical analysis", "impact": "Strategic Impact" },
                    { "id": "s3", "title": "Step Title", "description": "Logical analysis", "impact": "Strategic Impact" }
                ],
                "groundingData": [
                    { "label": "Label 1", "value": "Value 1" },
                    { "label": "Label 2", "value": "Value 2" },
                    { "label": "Label 3", "value": "Value 3" }
                ]
            }
        `;

    // 3. AI Synthesis
    const result = await geminiPro.generateContent(prompt);
    const reasoning: StrategicReasoning | null = extractJsonObject(
      result.response.text(),
    );

    return reasoning;
  } catch (error) {
    console.error("Strategic Synthesis Error:", error);
    return null;
  }
}
