import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, setDoc, doc, Timestamp } from "firebase/firestore";

const genAI = new GoogleGenerativeAI(process.env.VERTEX_AI_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "");

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const province = searchParams.get("province") || "Gauteng";
    
    // 1. Check Firestore Cache
    const briefingsRef = collection(db, "provinceIntelligenceBriefings");
    const q = query(briefingsRef, where("province", "==", province));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docData = snapshot.docs[0].data();
      const ageHours = (Date.now() - docData.timestamp.toMillis()) / (1000 * 60 * 60);
      // Force regeneration by temporarily aggressively invalidating the cache if it's over 1 minute old
      if (ageHours < 0.01) {
        return NextResponse.json(docData.briefing);
      }
    }

    // 2. Generate Real-time Intelligence via Gemini
    console.log(`[OSINT] Generating fresh province briefing for: ${province}`);
    
    // Fallback to flash-preview to guarantee successful inference on local user credentials
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
      You are the Chief Intelligence Officer for the South African Government.
      Generate a highly realistic, uncompromising, and absolutely brutal internal intelligence briefing on the current state of governance in the ${province} province.

      Do NOT hallucinate generic issues. Base the blindspots and priorities on actual ongoing historical facts, known infrastructure collapses, political squabbles, and known realities of ${province}. 
      Name specific syndicates, sectors, or demographic pressures if they apply.
      
      Respond STRICTLY with valid JSON in the following schema:
      {
        "alignments": "The exact governing coalition, majority structure, and any internal faction friction (e.g. 'ANC/DA GNU Friction', 'IFP/ANC High Alert')",
        "primaryLeader": "The full name and title of the presiding political leader (e.g. 'Premier Alan Winde', 'Premier Zamani Saul')",
        "status": "Macro Status of the province in 3 words (e.g. 'Volatile / Contested', 'Stable / Operational')",
        "blindspots": ["Exact threat 1", "Exact threat 2", "Exact threat 3"],
        "citizenPriorities": ["Electoral priority 1", "Electoral priority 2", "Electoral priority 3"],
        "atRiskExecutives": [
           { "name": "Executive Name", "reason": "Specific reason for political vulnerability" }
        ],
        "upcomingFlashpoints": ["Looming threat 1", "Looming threat 2"]
      }
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7
      }
    });

    const responseText = result.response.text();
    // Aggressively strip markdown JSON codeblocks that gemini occasionally hallucinates
    const cleanText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const object = JSON.parse(cleanText);

    // 3. Store in Firestore Cache
    const newDocRef = doc(briefingsRef);
    await setDoc(newDocRef, {
      province,
      briefing: object,
      timestamp: Timestamp.now()
    });

    return NextResponse.json(object);

  } catch (error) {
    console.error("[ProvinceBriefingError] Failed to generate AI intelligence:", error);
    return NextResponse.json(
      { error: "Failed to synthesize province intelligence." },
      { status: 500 }
    );
  }
}
