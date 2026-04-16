import { NewsArticle } from "@/types";

const API_KEY = process.env.NEWS_API_KEY;
const BASE_URL = "https://newsapi.org/v2";

export async function fetchStrategicNews(
  query: string,
  timeframe: "recent" | "historical" = "recent",
  pageSize: number = 5,
): Promise<NewsArticle[]> {
  try {
    if (!API_KEY) {
      console.warn("NEWS_API_KEY is missing. Skipping news fetch.");
      return [];
    }
    // We focus on South African regional news based on the query (Municipality/Service)
    const encodedQuery = encodeURIComponent(`${query} South Africa`);
    let url = `${BASE_URL}/everything?q=${encodedQuery}&apiKey=${API_KEY}&pageSize=${pageSize}&sortBy=relevancy&language=en`;

    if (timeframe === "recent") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const dateString = thirtyDaysAgo.toISOString().split("T")[0];
      url += `&from=${dateString}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "ok") {
      return data.articles;
    }

    console.error("NewsAPI Error:", data.message);
    return [];
  } catch (error) {
    console.error("Fetch News Error:", error);
    return [];
  }
}
