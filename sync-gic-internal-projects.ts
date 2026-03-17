import { loadEnv } from "./scripts/load-env-cli";
loadEnv();

async function runGICProjectsSync() {
    console.log("--- GIC INTERNAL PROJECT SYNC ---");
    
    // Import everything from the same source to avoid instance mismatch
    const { initializeApp, getApps, getApp } = await import("firebase/app");
    const { getFirestore, collection, addDoc, serverTimestamp } = await import("firebase/firestore");
    const { tavily: tavilySource } = await import("@tavily/core");
    const { GoogleGenerativeAI } = await import("@google/generative-ai");

    // Initialize Firebase directly in the script
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    };

    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const genAI = new GoogleGenerativeAI(process.env.VERTEX_AI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const tavily = tavilySource({ apiKey: process.env.TAVILY_API_KEY || "" });

    const GIC_PROJECTS = [
        "https://www.gic.co.za/project/bolokanang/",
        "https://www.gic.co.za/project/kwa-guqa/",
        "https://www.gic.co.za/project/nooitgedacht-plot-107-124/",
        "https://www.gic.co.za/project/sasolburg/",
        "https://www.gic.co.za/project/phola-x1/",
        "https://www.gic.co.za/project/prieska/",
        "https://www.gic.co.za/project/boxwood/",
        "https://www.gic.co.za/project/maokeng-x12/",
        "https://www.gic.co.za/project/maokeng-x10-x12-x13/",
        "https://www.gic.co.za/project/majwamasweu-x1-x5/",
        "https://www.gic.co.za/project/intabazwe-x2/",
        "https://www.gic.co.za/project/thubelihle-x8/",
        "https://www.gic.co.za/project/barkley-road-1481/",
        "https://www.gic.co.za/project/kathu-5700/",
        "https://www.gic.co.za/project/jurgenskamp/",
        "https://www.gic.co.za/project/williston-150/",
        "https://www.gic.co.za/project/dakota-409/",
        "https://www.gic.co.za/project/rosedale-iii/",
        "https://www.gic.co.za/project/rosedale-ii/",
        "https://www.gic.co.za/project/rosedale-400/",
        "https://www.gic.co.za/project/goutrou/",
        "https://www.gic.co.za/project/jacksonville-139/",
        "https://www.gic.co.za/project/ivory_park_1175/",
        "https://www.gic.co.za/project/empumelelweni-x8-x9/",
        "https://www.gic.co.za/project/groblershoop/",
        "https://www.gic.co.za/project/pabalello-881/",
        "https://www.gic.co.za/project/britstown-848/",
        "https://www.gic.co.za/project/the-villas/",
        "https://www.gic.co.za/project/smarties-324/",
        "https://www.gic.co.za/project/paballelo-north-east-990/",
        "https://www.gic.co.za/project/paballelo-makweta-valley-503/",
        "https://www.gic.co.za/project/ganspan-531/",
        "https://www.gic.co.za/project/calvinia-260/",
        "https://www.gic.co.za/project/breipaal-506/",
        "https://www.gic.co.za/project/gamakor-1541/",
        "https://www.gic.co.za/project/new_mapulaneng_hospital_phase_3b/",
        "https://www.gic.co.za/project/opwag-748/",
        "https://www.gic.co.za/project/hlalanikahle-section-l/",
        "https://www.gic.co.za/project/hlalanikahle-section-c/"
    ];

    console.log(`Targeting ${GIC_PROJECTS.length} official projects...\n`);

    for (const url of GIC_PROJECTS) {
        console.log(`Processing: ${url}`);
        
        try {
            const search = await tavily.search(url, {
                searchDepth: "advanced",
                // @ts-ignore
                includeRawContent: true,
                maxResults: 1
            });

            const rawContent = search.results[0]?.rawContent || "";
            
            if (!rawContent) {
                console.warn(`  [SKIP] No content found for ${url}`);
                continue;
            }

            const prompt = `
                Extract structured information from this GIC Project page:
                ${rawContent.substring(0, 50000)}

                Return a JSON object:
                {
                    "projectName": "Exact Project Name",
                    "municipality": "Municipality",
                    "province": "Province",
                    "country": "South Africa",
                    "status": "active|completed|planned",
                    "scope": "Detailed description of services (roads, water, sewer, etc.)",
                    "impact": "Number of stands, households, or community benefits",
                    "completionDate": "If mentioned, otherwise null",
                    "projectType": "Civil|Roads|Health|Planning|Structural",
                    "latitude": number | null,
                    "longitude": number | null
                }
            `;

            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                
                await addDoc(collection(db, "strategicDatasets"), {
                    domain: "GICInternal",
                    datasetId: `GIC_${data.projectName.replace(/\s+/g, '_')}`,
                    municipality: data.municipality,
                    province: data.province,
                    country: "South Africa",
                    payload: data,
                    source: "Official GIC Portal (gic.co.za)",
                    confidence: 1.0,
                    status: "active",
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
                console.log(`  [OK] Synced: ${data.projectName} (${data.municipality})`);
            }

            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            console.error(`  [ERROR] Failed to sync ${url}:`, error);
        }
    }

    console.log("\n--- SYNC COMPLETE ---");
}

runGICProjectsSync().catch(console.error);
