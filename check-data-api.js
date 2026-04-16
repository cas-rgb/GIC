async function checkData() {
  try {
     console.log("=== CHECKING WARD INTELLIGENCE (City of Johannesburg) ===");
     const wardsRes = await fetch("http://localhost:3000/api/analytics/ward-intelligence?municipality=City%20of%20Johannesburg");
     const wardsData = await wardsRes.json();
     console.log(`Wards found for Johannesburg: ${wardsData.wards?.length || 0}`);
     if (wardsData.wards?.length > 0) {
        console.log(`Sample Ward: ${wardsData.wards[0].wardName || wardsData.wards[0].wardId}`);
     }

     console.log("\n=== CHECKING WARD INTELLIGENCE (Tshwane) ===");
     const tWardsRes = await fetch("http://localhost:3000/api/analytics/ward-intelligence?municipality=City%20of%20Tshwane");
     const tWardsData = await tWardsRes.json();
     console.log(`Wards found for Tshwane: ${tWardsData.wards?.length || 0}`);
     if (tWardsData.wards?.length > 0) {
        console.log(`Sample Ward: ${tWardsData.wards[0].wardName || tWardsData.wards[0].wardId}`);
     }
     
     console.log("\n=== CHECKING DEEP SOCIAL TRENDS (Gauteng) ===");
     const socialRes = await fetch("http://localhost:3000/api/analytics/deep-social?province=Gauteng");
     const socialData = await socialRes.json();
     console.log(`Trending Articles: ${socialData.trendingArticles?.length || 0}`);
     console.log(`YouTube Trends: ${socialData.youtubeTrends?.length || 0}`);

  } catch(e) {
      console.error(e.message);
  }
}
checkData();
