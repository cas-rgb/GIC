
const key = '8b616b4ba61348deb1cc2187c79114bf';

async function testNewsAPI() {
    try {
        const url = `https://newsapi.org/v2/everything?q=South+Africa&apiKey=${key}&pageSize=1`;
        const res = await fetch(url);
        const data = await res.json();
        console.log('--- NewsAPI.org Test ---');
        console.log('Status:', data.status);
        if (data.status === 'ok') console.log('Provider: NewsAPI.org');
    } catch (e) {
        console.error('NewsAPI.org Fetch Error');
    }
}

async function testGNews() {
    try {
        const url = `https://gnews.io/api/v4/search?q=South+Africa&token=${key}&max=1`;
        const res = await fetch(url);
        const data = await res.json();
        console.log('--- GNews Test ---');
        if (data.articles) console.log('Provider: GNews');
        else console.log('GNews Status:', data.errors || 'Fail');
    } catch (e) {
        console.error('GNews Fetch Error');
    }
}

async function run() {
    await testNewsAPI();
    await testGNews();
}

run();
