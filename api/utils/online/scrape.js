const axios = require('axios')
var { Readability } = require('@mozilla/readability');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", () => {
    // No-op to skip console errors.
});

const scrape = async function (url) {
    try {
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.',
                Referer: 'https://www.google.com',
                'Accept-Language': 'en-US,en;q=0.9',
                Cookie: 'username=mk_liang;',
                'Cache-Control': 'no-cache'
            },
            timeout: 15000
        })
        const html = res.data
        //console.log(html)
        var doc = new JSDOM(html, { virtualConsole });
        let reader = new Readability(doc.window.document);
        let article = reader.parse();
        //console.log(article)
        return article
    } catch (e) {
        logger.debug('timeout!')
        return { textContent: 'Scraping failed. No useful data.' }
    }
}

module.exports = scrape;