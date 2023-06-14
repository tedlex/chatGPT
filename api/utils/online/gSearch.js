const axios = require('axios')
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", () => {
    // No-op to skip console errors.
});
const fs = require('fs');
const logger = require('../logger')



const sortSearch = function (searchResults) {
    searchResults.items.forEach(item => {

        let matchArr;

        matchArr = item.snippet.match(/(\d+)\s+days{0,1}\s+ago/);
        if (matchArr && matchArr.length > 0) {
            const num = parseInt(matchArr[1]);
            //logger.debug(`The number before "days ago" is: ${num}`);
            let currentDate = new Date();
            let xDaysAgo = currentDate.getTime() - (num * 24 * 60 * 60 * 1000);
            item.date = new Date(xDaysAgo)
        }

        matchArr = item.snippet.match(/[A-Z][a-z]{2}\s\d{1,2},\s\d{4}/);
        if (matchArr && matchArr.length > 0) {
            //console.log(`date is: ${matchArr[0]}`);
            item.date = new Date(matchArr[0])
        }

        matchArr = item.snippet.match(/(\d+)\s+hours{0,1}\s+ago/);
        if (matchArr && matchArr.length > 0) {
            const num = parseInt(matchArr[1]);
            //logger.debug(`The number before "hours ago" is: ${num}`);
            let currentDate = new Date();
            let xHoursAgo = currentDate.getTime() - (num * 60 * 60 * 1000);
            item.date = new Date(xHoursAgo);
        }

        matchArr = item.snippet.match(/(\d+)\s+minutess{0,1}\s+ago/);
        if (matchArr && matchArr.length > 0) {
            const num = parseInt(matchArr[1]);
            //logger.debug(`The number before "minutes ago" is: ${num}`);
            let currentDate = new Date();
            let xHoursAgo = currentDate.getTime() - (num * 60 * 1000);
            item.date = new Date(xHoursAgo);
        }

        if (item.link.includes("wikipedia") || item.link.includes("imdb.com") || item.link.includes("rottentomatoes.com")) {
            item.date = new Date();
        }

    })

    const itemsWithDate = searchResults.items.filter(item => item.date);
    const itemsWithoutDate = searchResults.items.filter(item => !item.date);

    itemsWithDate.sort((a, b) => b.date - a.date);
    itemsWithoutDate.forEach(item => {
        itemsWithDate.splice(Math.floor(itemsWithDate.length / 2), 0, item);
    });

    searchResults.items = itemsWithDate
};


const extractBlock = (d, searchResults) => {
    let item = {}
    //console.log(d.getAttribute('class'))
    const h3 = d.querySelector('a > h3')
    if (h3) {
        //console.log(h3.innerHTML)
        item.title = h3.innerHTML
        item.link = h3.parentNode.getAttribute("href")
        const snippet = d.querySelector('[data-sncf="1"]')
        if (snippet) {
            //console.log(snippet.textContent)
            item.snippet = snippet.textContent
        } else {
            item.snippet = 'None'
            let log = '\n\n\n\n\n--------------- no snippet ---------------'
            log += d.innerHTML
            fs.appendFile('scrapGoogleError.txt', log, (err) => {
                if (err) throw err;
                logger.debug('The file has been saved!');
            });
            logger.debug('--------------no snippet ----------')
        }
        searchResults.items.push(item)
    } else {
        let log = '\n\n\n\n\n--------------- no h3 ---------------'
        log += d.innerHTML
        fs.appendFile('scrapGoogleError.txt', log, (err) => {
            if (err) throw err;
            logger.debug('The file has been saved!');
        });
        logger.debug('--------------no h3----------')
    }
}


const search = async function (q, start = 1) {
    //console.log(`---------------search options-------------`)
    let searchResults = {}
    let query = q
    query += ' -site:youtube.com'
    query += ' -site:weather.com'
    let url = `https://www.google.com/search?client=safari&start=${start}&rls=en&q=${query.replaceAll(' ', '+')}&ie=UTF-8&oe=UTF-8#ip=1`
    logger.debug(url)
    searchResults.q = query
    searchResults.start = start
    searchResults.items = []
    try {
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
                Referer: 'https://www.google.com',
                'Accept-Language': 'en-US,en;q=0.9',
                Cookie: 'username=mark_liu;',
                'Cache-Control': 'no-cache'
            },
            timeout: 10000
        })
        const html = res.data
        // fs.writeFile('scrapGoogle5.html', html, (err) => {
        //     if (err) throw err;
        //     logger.debug('The file has been saved!');
        // });

        var doc = new JSDOM(html, { virtualConsole });
        let rso = doc.window.document.querySelector('#rso')
        //console.log(rso)
        let rsoDiv = doc.window.document.querySelectorAll('#rso > div')
        //console.dir(rsoDiv[0].textContent)
        rsoDiv.forEach(d => {
            //console.log(d.getAttribute('class'))
            const g = d.querySelector('[class="g"]')
            if (g) {
                const divs = g.querySelectorAll(':scope>div')
                console.log(`class = g with ${divs.length} divs`)
                divs.forEach(d => {
                    extractBlock(d, searchResults)
                })
            } else {
                extractBlock(d, searchResults)
            }

            //console.log(d.textContent)
        })
        // if (searchResults.items.length !== 10) {
        //     console.log('--------------no 10 items ----------')
        //     let log = '\n\n\n\n\n--------------- no 10 items ---------------'
        //     log += rso.innerHTML
        //     fs.appendFile('scrapGoogleError.txt', log, (err) => {
        //         if (err) throw err;
        //         console.log('The file has been saved!');
        //     });
        // }

        sortSearch(searchResults)
        logger.debug(searchResults)
    } catch (e) {
        console.log(e)
    }
    return searchResults
}

module.exports = search;