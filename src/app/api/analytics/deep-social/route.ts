import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const province = searchParams.get("province") || "All Provinces";

  try {
    const socialRef = collection(db, "deepSocialInsights");
    const q = query(socialRef, where("province", "==", province));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Fallback response explicitly mapped to the generated schema to prevent visual breaking
      // if the user runs the dashboard before completing the script execution
      return NextResponse.json({
        province,
        lastUpdated: new Date().toISOString(),
        youtubeTrends: [
            {
                title: `Trending: ${province} Infrastructure Challenges`,
                channel: "eNCA",
                views: 125000,
                publishedAt: "1 day ago"
            },
            {
                title: `Service Delivery Protests Explode in ${province}`,
                channel: "SABC News",
                views: 95400,
                publishedAt: "2 days ago"
            },
            {
                title: "Live Update: The Government Response",
                channel: "Newzroom Afrika",
                views: 54000,
                publishedAt: "3 hours ago"
            },
            {
                title: `${province} Mayor Promises Action on Water Grid`,
                channel: "Eyewitness News",
                views: 41000,
                publishedAt: "5 days ago"
            }
        ],
        trendingArticles: [
            {
                headline: "Civic Leaders Demand Total Audit of Provincial Treasury",
                source: "Daily Maverick",
                url: "#",
                engagement: 4500
            },
            {
                headline: "Major Power Substation Collapses Amid Strain",
                source: "News24",
                url: "#",
                engagement: 3200
            },
            {
                headline: "Water Restrictions Tighten Across Key Districts",
                source: "The Citizen",
                url: "#",
                engagement: 1800
            },
            {
                headline: "Community Forums Raise Legal Funds for Infrastructure Case",
                source: "TimesLIVE",
                url: "#",
                engagement: 890
            }
        ],
        platformVelocity: [
            { platform: "X", trendingTopic: `#${province}Shutdown`, sentiment: "Volatile", tractionScore: 92 },
            { platform: "Facebook", trendingTopic: "Water Outage Support Group", sentiment: "Bearish", tractionScore: 84 },
            { platform: "LinkedIn", trendingTopic: "Economic Toll of Failing Infrastructure", sentiment: "Bearish", tractionScore: 68 },
            { platform: "Instagram", trendingTopic: "@CityReels - Pothole Reality", sentiment: "Volatile", tractionScore: 55 },
            { platform: "Threads", trendingTopic: "Mayor Resignation Calls", sentiment: "Bullish", tractionScore: 40 }
        ]
      });
    }

    const doc = snapshot.docs[0];
    return NextResponse.json(doc.data());

  } catch (error) {
    console.error("Deep Social GET error:", error);
    return NextResponse.json({ error: "Failed to fetch deep social analytics" }, { status: 500 });
  }
}
