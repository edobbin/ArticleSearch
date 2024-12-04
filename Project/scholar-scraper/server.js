//# server.js
const express = require('express');
const path = require('path');
const scraper = require('./scraper');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/search', async (req, res) => {
    const { keywords } = req.body;
    try {
        const articles = await scraper.scrapeGoogleScholarRecursive(keywords);
        res.json({ articles });
    } catch (error) {
        console.error('Error in recursive search:', error);
        res.status(500).json({ error: 'Failed to complete the search' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
