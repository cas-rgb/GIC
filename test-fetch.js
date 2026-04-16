async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/analytics/deep-social?province=All%20Provinces');
    const data = await res.json();
    console.log("STATUS:", res.status);
    console.log("PAYLOAD CACHE-CONTROL:", res.headers.get('cache-control'));
    console.log("TRENDING ARTICLES PAYLOAD:", JSON.stringify(data.trendingArticles, null, 2));
    console.log("YOUTUBE TRENDS PAYLOAD:", JSON.stringify(data.youtubeTrends, null, 2));
  } catch (err) {
    console.error("Fetch Error:", err.message);
  }
}
test();
