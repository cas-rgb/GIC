import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const key = process.env.VERTEX_AI_API_KEY || "";
    if (!key) return NextResponse.json({ error: "No VERTEX_AI_API_KEY environment variable. Has .env been loaded?" });

    const genAI = new GoogleGenerativeAI(key);
    
    // Testing the same model the action uses
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    
    const result = await model.generateContent("Reply with exactly: 'KEY_IS_VALID'");
    const text = result.response.text();
    
    return NextResponse.json({ 
      success: true, 
      text, 
      keyPrefix: key.substring(0, 10) + "..." 
    });
  } catch (error: any) {
    console.error("Gemini API Test Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || String(error), 
      stack: error.stack 
    });
  }
}
