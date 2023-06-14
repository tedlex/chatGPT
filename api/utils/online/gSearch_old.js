const { google } = require('googleapis');
const config = require('../../config');
const customsearch = google.customsearch('v1');
const { getLocalTimeObj, queryToken, generateChartData, getCost, getDate } = require('../time')

const sortSearch = function (searchResults) {
    searchResults.items.forEach(item => {

        let matchArr;

        matchArr = item.snippet.match(/(\d+)\s+days{0,1}\s+ago/);
        if (matchArr && matchArr.length > 0) {
            const num = parseInt(matchArr[1]);
            //console.log(`The number before "days ago" is: ${num}`);
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
            console.log(`The number before "hours ago" is: ${num}`);
            let currentDate = new Date();
            let xHoursAgo = currentDate.getTime() - (num * 60 * 60 * 1000);
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


const search = async function (q) {
    //console.log(`---------------search options-------------`)
    const options = {
        auth: config.ggApiKey,
        cx: config.ggCx,
        q,
        start: 1,
        num: 10,
        siteSearch: "youtube.com",
        siteSearchFilter: "e"
    }
    //console.log(options)
    const result = await customsearch.cse.list(options)
    const data = await result.data
    const { queries, items, searchInformation } = data;

    const page = (queries.request || [])[0] || {};
    const previousPage = (queries.previousPage || [])[0] || {};
    const nextPage = (queries.nextPage || [])[0] || {};

    const itemsFiltered = items.filter(item => !item.link.includes("weather.com"))



    const x = {
        q,
        totalResults: page.totalResults,
        count: page.count,
        startIndex: page.startIndex,
        nextPage: nextPage.startIndex,
        previousPage: previousPage.startIndex,
        time: searchInformation.searchTime,
        items: itemsFiltered.map(o => ({
            link: o.link,
            title: o.title,
            snippet: o.snippet,
            //img: (((o.pagemap || {}).cse_image || {})[0] || {}).src
        }))
    }
    //console.log(x)

    sortSearch(x)
    console.log(x)
    return x
}

//search('iphone 15 news')
module.exports = search;