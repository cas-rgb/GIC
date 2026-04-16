import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const docRef = doc(db, "settings", "investorship_pipeline");
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return NextResponse.json({ saved: snapshot.data().savedIds || [] });
    }
    return NextResponse.json({ saved: [] });
  } catch (error) {
    console.error("Failed to get saved investors from Firebase:", error);
    return NextResponse.json({ saved: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, action } = body;
    
    const docRef = doc(db, "settings", "investorship_pipeline");
    const snapshot = await getDoc(docRef);
    
    let savedIds: string[] = [];
    if (snapshot.exists()) {
      savedIds = snapshot.data().savedIds || [];
    }
    
    if (action === "save" && !savedIds.includes(id)) {
      savedIds.push(id);
    } else if (action === "unsave") {
      savedIds = savedIds.filter(i => i !== id);
    }
    
    await setDoc(docRef, { savedIds }, { merge: true });
    
    return NextResponse.json({ success: true, saved: savedIds });
  } catch (error) {
    console.error("Failed to update saved investors in Firebase:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

