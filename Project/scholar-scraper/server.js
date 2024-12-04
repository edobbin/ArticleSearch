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


//update the keywords after the initial search (recurssive scholar search)
//do this until article limit of 20 is hit
app.post('/search', async (req, res) => {
    const { keywords } = req.body;
    const articles = await scraper.scrapeGoogleScholar(keywords);
    res.json({ articles });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
