import { GoogleGenerativeAI } from "@google/generative-ai";
import { tavilyClient } from "@/lib/tavily";

const genAI = new GoogleGenerativeAI(process.env.VERTEX_AI_API_KEY || "");

export async function executeDeepInvestigation(targetEntity: string, maxLoops: number = 2) {
  const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });
  let loopCount = 0;
  let currentTarget = targetEntity;
  let investigationContext = ``;

  console.log(`[AGENTIC INVESTIGATOR] Initiating execution on target: ${targetEntity}`);

  while (loopCount < maxLoops) {
    loopCount++;
    console.log(`[AGENTIC INVESTIGATOR] Loop ${loopCount}/${maxLoops}: Searching for ${currentTarget}`);
    
    // 1. Tool Call: Search Web
    const searchData = await tavilyClient.search(currentTarget, { searchDepth: "advanced", maxResults: 4 });
    const searchFindings = JSON.stringify(searchData);
    investigationContext += `\n\n--- SEARCH RESULTS FOR [${currentTarget}] ---\n${searchFindings}`;

    // 2. Synthesis & Decision Logic
    const prompt = `
      You are an autonomous intelligence agent acting for the South African Government.
      You are conducting a deep investigation into: "${targetEntity}".
      
      Below is the accrued context from your web searches so far.
      ${investigationContext}
      
      Read the context carefully. Does the context mention any associated Secondary Entities (e.g., hidden companies, political figures, rival groups) that we have NOT yet searched for, but that are critical to understanding "${targetEntity}"?
      
      If YES, you must output exactly ONE new search term that we should execute next to uncover deeper ties. Output ONLY that search term as a plain string.
      If NO, or if you feel you have enough information to write a comprehensive dossier, output exactly: "TERMINATE_SEARCH".
    `;

    const decisionResponse = await model.generateContent(prompt);
    const decision = decisionResponse.response.text().trim();

    if (decision === "TERMINATE_SEARCH" || decision === "") {
        console.log(`[AGENTIC INVESTIGATOR] Agent decided to TERMINATE recursive loop.`);
        break;
    } else {
        console.log(`[AGENTIC INVESTIGATOR] Agent extracted secondary entity: ${decision}`);
        currentTarget = decision; // Feed the new secondary entity into the next loop iteration
    }
  }

  console.log(`[AGENTIC INVESTIGATOR] Final Synthesis generation.`);
  // Final Synthesis
  const finalPrompt = `
    You are the Chief Intelligence Analyst. Synthesize the following raw web search context into a highly formal, deep investigative dossier on the primary target: "${targetEntity}".
    Ensure you highlight all discovered secondary networks, financial ties, and geopolitical implications found in the search context.
    
    CRITICAL INSTRUCTION: You MUST establish unquestionable Institutional Trust. For every single factual claim, financial tie, or event you extract, you MUST append an inline citation (e.g. [1], [2]) mapped to the specific search result it was derived from.
    At the very end of your response, you MUST append a section titled "### Verified Sources" listing the indices and the exact URLs representing those items.
    
    Context Data:
    ${investigationContext}
  `;

  const finalReport = await model.generateContent(finalPrompt);
  return {
      targetEntity,
      loopsExecuted: loopCount,
      dossier: finalReport.response.text().trim()
  };
}
