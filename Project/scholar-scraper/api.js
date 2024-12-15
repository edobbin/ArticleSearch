//# api.js
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

module.exports = { searchGoogleScholar };
