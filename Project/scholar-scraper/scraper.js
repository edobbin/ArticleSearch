const axios = require('axios');
const cheerio = require('cheerio');
var articleCount = 0;

async function scrapeGoogleScholar(keywords) {
    const searchURL = `https://scholar.google.com/scholar?q=${encodeURIComponent(keywords)}`;
    try {
        const { data } = await axios.get(searchURL);
        const $ = cheerio.load(data);
        let articles = [];

        //scrapes the title
        //put a limit to how much articles are generated from one keyword (between 5-10)
        $('.gs_rt a').each((index, element) => {
            if (articleCount >= 10){
                return false;
            } 
            const title = $(element).text();
            const link = $(element).attr('href');
            const citation = $(element).closest('div.gs_ri').find('.gs_a').text();
            articles.push({title, link, citation})
            articleCount += 1; //How many articles have been scraped. Shouldnt be higher than 20
            
        });

        return articles;

        //Scrape the article titles and generate new keywords from those

    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

//You can update the keyword function here to check the article generation in the terminal
(async () => {
    const keywords = 'Example'; //Example Keywords
    //const articles = await scrapeGoogleScholar(keywords);
    //console.log(articles);
})();

module.exports = { scrapeGoogleScholar };