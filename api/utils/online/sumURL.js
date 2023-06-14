const { encode, decode } = require('gpt-3-encoder')
const AsyncLock = require('async-lock');
const search = require('./gSearch');
const scrape = require('./scrape');
const getQuery = require('./getQuery');
const extract_article = require('./extract');
const checkAnswer = require('./checkAnswer');
const logger = require('../logger')

const md = require('../markdown')



async function sumURL(item, question, result_status, lock, res) {
    logger.debug('---------search item ----------------')
    logger.debug(item)
    const url = item.link
    await lock.acquire("result_status", async () => {
        result_status.contentAll += `  \nExtracting:  [${item.title}](${url})`
        res.write(`data: ${JSON.stringify({ content: md.render(result_status.contentAll) })}\n\n`);
    });

    let article = await scrape(url)
    try {
        let tokens = encode(article.textContent)
        logger.debug(`article length: ${tokens.length}`)
        if (tokens.length > 12000) {
            logger.debug('截取12000')
            article.textContent = decode(tokens.slice(0, 12000))
        }
    } catch (e) {
        article = { textContent: 'Scraping failed. No useful data.' }
    }


    let { information: information_part, tokens_ } = await extract_article(article.textContent, question, result_status.language)
    await lock.acquire("result_status", async () => {
        result_status.tokens += tokens_
        const valid_info = checkAnswer(information_part)
        if (valid_info.length > 0) {
            valid_info.unshift(`document date: ${item.date?.toString().slice(0, 15)}`)
            result_status.information.push(valid_info)
            result_status.valid_count += 1
            result_status.contentAll = result_status.contentAll.replace(`Extracting:  [${item.title}](${url})`, `Extracting:  [${item.title}](${url}) finished`)
        } else {
            logger.debug('no userful information of this url')
            result_status.contentAll = result_status.contentAll.replace(`Extracting:  [${item.title}](${url})`, `Extracting:  [${item.title}](${url}) no information detected`)
        }
    });
    res.write(`data: ${JSON.stringify({ content: md.render(result_status.contentAll) })}\n\n`);
}


const question2information = async (question, res) => {
    logger.debug('-------------question 2 infnormation-----------')
    let result_status = { tokens: 0, valid_count: 0, information: [], contentAll: '', language: "English" }
    let { query, tokens_ } = await getQuery(question);
    result_status.tokens += tokens_
    if (query === 'NONE') {
        result_status.contentAll += 'Query Error\n'
        res.write(`data: ${JSON.stringify({ content: md.render(result_status.contentAll) })}\n\n`);
        logger.debug('query===None  return')
        query = { query: question.content, lang: "English" }
    }
    result_status.contentAll += 'Searching: ' + query.query
    result_status.language = query.lang
    res.write(`data: ${JSON.stringify({ content: md.render(result_status.contentAll) })}\n\n`);

    const searchResults = await search(query.query);
    const lock = new AsyncLock();
    let i = 0;
    while ((result_status.valid_count < 2) && (i < searchResults.items.length)) {
        const items = searchResults.items.slice(i, i + 3);
        const promises = items.map(async (item) => sumURL(item, question, result_status, lock, res));
        await Promise.all(promises);
        i = i + 3
    }

    return result_status
}


module.exports = question2information
