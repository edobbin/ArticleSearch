// test_api.js
require('dotenv').config();
const SerpApi = require('google-search-results-nodejs');

// Function to query Google Scholar via SerpAPI
const searchGoogleScholar = async (query) => {
    const search = new SerpApi.GoogleSearch(process.env.SERPAPI_KEY);

    return new Promise((resolve, reject) => {
        search.json({ engine: "google_scholar", q: query }, (data) => {
            resolve(data.organic_results || []);
        }, (error) => {
            reject(error);
        });
    });
};

// Main function to test the API
const runTest = async () => {
    const testQuery = "bio markers for cancer";

    try {
        console.log(`Searching Google Scholar for: "${testQuery}"`);
        const results = await searchGoogleScholar(testQuery);

        if (results.length > 0) {
            console.log(`Found ${results.length} articles:`);
            results.forEach((article, index) => {
                const authors = article.authors || "Unknown authors";
                const publicationInfo = article.publication_info?.summary || "N/A";

                console.log(`\nArticle ${index + 1}`);
                console.log(`Title: ${article.title}`);
                console.log(`Link: ${article.link}`);
                console.log(`Snippet: ${article.snippet || "No snippet available"}`);
                console.log(`Authors: ${authors}`);
                console.log(`Publication Info: ${publicationInfo}`);
            });
        } else {
            console.log("No articles found.");
        }
    } catch (error) {
        console.error("Error fetching articles from Google Scholar:", error.message);
    }
};

// Run the test
runTest();
