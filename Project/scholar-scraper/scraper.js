//# scraper.js
const axios = require('axios');
const cheerio = require('cheerio');

// Introduce a delay function
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeGoogleScholar(keywords) {
    const searchURL = `https://scholar.google.com/scholar?q=${encodeURIComponent(keywords)}`;
    try {
        const { data } = await axios.get(searchURL);
        const $ = cheerio.load(data);
        let articles = [];

        // Scrape titles
        $('.gs_rt a').each((index, element) => {
            const title = $(element).text();
            articles.push(title);
        });

        return articles;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

async function scrapeGoogleScholarRecursive(keywords, limit = 20, articles = []) {
    if (articles.length >= limit) {
        return articles.slice(0, limit);
    }

    console.log(`Fetching articles for keyword: ${keywords}`);

    const newArticles = await scrapeGoogleScholar(keywords);
    const uniqueArticles = [...new Set([...articles, ...newArticles])]; // Ensure no duplicates

    console.log(`Fetched ${newArticles.length} articles, Total Articles: ${uniqueArticles.length}`);

    // Generate new keywords from current titles
    const newKeywords = generateKeywords(newArticles);

    if (newKeywords.length > 0 && uniqueArticles.length < limit) {
        console.log(`Generated new keyword: ${newKeywords[0]}`);
        console.log(`Waiting 2 seconds before next request to respect Google Scholar's servers.`);
        await delay(2000); // 2-second delay
        return scrapeGoogleScholarRecursive(newKeywords[0], limit, uniqueArticles);
    }

    return uniqueArticles;
}

function generateKeywords(titles) {
    const keywords = new Set();
    titles.forEach(title => {
        title.split(/\s+/).forEach(word => {
            if (word.length > 3) keywords.add(word.toLowerCase()); // Use words with length > 3
        });
    });
    return Array.from(keywords);
}

module.exports = { scrapeGoogleScholarRecursive };
