import { NewsArticle } from "@/types";

const API_KEY = process.env.NEWS_API_KEY;
const BASE_URL = "https://newsapi.org/v2";

export async function fetchStrategicNews(
  query: string,
  pageSize: number = 5,
): Promise<NewsArticle[]> {
  try {
    if (!API_KEY) {
      console.warn("NEWS_API_KEY is missing. Skipping news fetch.");
      return [];
    }
    // We focus on South African regional news based on the query (Municipality/Service)
    const encodedQuery = encodeURIComponent(`${query} South Africa`);
    const url = `${BASE_URL}/everything?q=${encodedQuery}&apiKey=${API_KEY}&pageSize=${pageSize}&sortBy=relevancy&language=en`;

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
