//# server.js
require('dotenv').config(); // Load environment variables
const express = require('express');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const axios = require('axios'); // For Hugging Face API requests
const { searchGoogleScholar } = require('./api'); // Import Google Scholar search function

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and serve static files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to calculate cosine similarity
const cosineSimilarity = (vecA, vecB) => {
    const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
};

// Helper function to fetch embeddings from Hugging Face
const fetchEmbeddings = async (text) => {
    try {
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2',
            { inputs: text },
            { headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` } }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching embeddings:', error.response?.data || error.message);
        throw error;
    }
};

// Endpoint to search and rank articles
app.post('/search', async (req, res) => {
    const { keywords } = req.body;

    if (!keywords || keywords.trim() === '') {
        return res.status(400).json({ error: 'Keywords are required for the search.' });
    }

    try {
        const articles = await searchGoogleScholar(keywords);

        // Get query embedding
        const queryEmbedding = await fetchEmbeddings(keywords);

        // Rank articles by semantic similarity
        const rankedArticles = await Promise.all(
            articles.map(async (article) => {
                const articleText = `${article.title} ${article.snippet}`;
                const articleEmbedding = await fetchEmbeddings(articleText);

                const similarity = cosineSimilarity(queryEmbedding, articleEmbedding);

                return {
                    title: article.title,
                    authors: article.authors || 'Unknown authors',
                    snippet: article.snippet || 'No excerpt available',
                    similarityScore: similarity.toFixed(2),
                };
            })
        );

        // Sort by similarity score and return top 10
        const topArticles = rankedArticles
            .sort((a, b) => b.similarityScore - a.similarityScore)
            .slice(0, 10);

        res.json({ articles: topArticles });
    } catch (error) {
        console.error('Error in /search:', error);
        res.status(500).json({ error: 'Failed to fetch articles.' });
    }
});

// Endpoint to export results to Excel
app.post('/export', (req, res) => {
    const { articles } = req.body;

    if (!articles || articles.length === 0) {
        return res.status(400).json({ error: 'No articles to export.' });
    }

    try {
        // Prepare data for the Excel file
        const workbook = xlsx.utils.book_new();
        const worksheetData = articles.map((article, index) => ({
            'S.No': index + 1,
            Title: article.title,
            Authors: article.authors,
            Excerpt: article.snippet,
            Similarity: article.similarityScore,
        }));

        const worksheet = xlsx.utils.json_to_sheet(worksheetData);
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Articles');

        // Ensure export folder exists
        const exportDir = path.join(__dirname, 'exports');
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir);
        }

        // Write workbook to file
        const filePath = path.join(exportDir, 'articles.xlsx');
        xlsx.writeFile(workbook, filePath);

        res.json({ message: 'Export successful!', filePath });
    } catch (error) {
        console.error('Error exporting articles:', error);
        res.status(500).json({ error: 'Failed to export articles.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
