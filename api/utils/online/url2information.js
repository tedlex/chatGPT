const { encode, decode } = require('gpt-3-encoder')
const AsyncLock = require('async-lock');
const scrape = require('./scrape');
const extract_article = require('./extract');
const checkAnswer = require('./checkAnswer');
const extractUrls = require('./extractUrls');
const logger = require('../logger')

const md = require('../markdown')



async function sumURL(url, question, result_status, lock, res) {
    logger.debug('---------search url ----------------')
    logger.debug(url)
    await lock.acquire("result_status", async () => {
        result_status.contentAll += `  \nExtracting:  [${url}](${url})`
        res.write(`data: ${JSON.stringify({ content: md.render(result_status.contentAll) })}\n\n`);
    });

    let article = await scrape(url)
    res.write(`data: ${JSON.stringify({ content: md.render(result_status.contentAll) })}\n\n`);
    try {
        let tokens = encode(article.textContent)
        logger.debug(`article length: ${tokens.length}`)
    } catch (e) {
        article = { textContent: 'Scraping failed. No useful data.' }
    }
    logger.debug('--------------------scraping--------------')
    //console.log(article)


    let { information: information_part, tokens_ } = await extract_article(article.textContent, question, result_status.language)
    await lock.acquire("result_status", async () => {
        result_status.tokens += tokens_
        const valid_info = checkAnswer(information_part)
        if (valid_info.length > 0) {
            valid_info.unshift(`document title: ${article.title}`)
            result_status.information.push(valid_info)
            //result_status.valid_count += 1
            result_status.contentAll = result_status.contentAll.replace(`Extracting:  [${url}](${url})`, `Extracting:  [${article.title}](${url}) finished`)
        } else {
            logger.debug('no userful information of this url')
            result_status.contentAll = result_status.contentAll.replace(`Extracting:  [${url}](${url})`, `Extracting:  [${article.title}](${url}) no information detected`)
        }
    });
    res.write(`data: ${JSON.stringify({ content: md.render(result_status.contentAll) })}\n\n`);
}


const url2information = async (question, res) => {
    logger.debug('-------------url 2 infnormation-----------')
    let result_status = { tokens: 0, information: [], contentAll: '', language: "English" }
    //let { query, tokens_ } = await getQuery(question);

    const urls = extractUrls(question.content)
    logger.debug('extrac urls from question')
    logger.debug(urls)
    result_status.contentAll += 'Urls detected... '
    res.write(`data: ${JSON.stringify({ content: md.render(result_status.contentAll) })}\n\n`);

    const lock = new AsyncLock();

    const promises = urls.map(async (url) => sumURL(url, question, result_status, lock, res));
    await Promise.all(promises);


    return result_status
}


module.exports = url2information