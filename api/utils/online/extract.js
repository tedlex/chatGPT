const config = require('../../config');
const { encode, decode } = require('gpt-3-encoder')
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: config.openaiKey
});
const openai = new OpenAIApi(configuration);
const logger = require('../logger')

const split_article = function (article, batchLen = 2500, offset = 0) {
    let tokens = encode(article)
    let nextToken = 0
    //let batchLen = 2500
    let message_batches = []
    while (nextToken < tokens.length) {
        let batchEnd
        if (tokens.length - nextToken > batchLen) {
            logger.debug(`------------剩余${tokens.length - nextToken}token, 超过max，进行分段---------`)
            const k = tokens.slice(nextToken, nextToken + batchLen).lastIndexOf(encode('.')[0])
            if (k === -1) {
                batchEnd = nextToken + batchLen
            } else {
                batchEnd = nextToken + k + 1
            }
        } else {
            batchEnd = nextToken + batchLen
        }
        const batchTokens = tokens.slice(Math.max(nextToken - offset, 0), batchEnd)
        message_batches.push(decode(batchTokens))
        nextToken = batchEnd
    }
    return message_batches
}

const extract_batch = async function (message, question, language) {
    let messages = [{ role: 'user', content: `We have several docments to answer a question. They are too long so we have to read them part by part, extract useful information from each part, and finally answer the question with information from each part. Below is a part of them. Now you need to extract useful information from this part that could be helpful to answer the question. Remember, your task is to extract and summarize information, not to answer the final question. Please extract as much useful information as you can. The question is: [${question.content}].Question date:[${question.date}]. The part of documents is: [${message}]` }]
    if (language.toUpperCase() === "CHINESE") {
        messages = [{ role: 'user', content: `我们已经搜集了一些资料用来回答一个问题。由于资料太长，现在把它分成一些小部分逐个分析。现在你的任务是从下面这一部分资料中，提取出回答问题所需要的相关信息。记住你的任务只是提取有用的信息，不需要回答最终问题。尽量多的提取信息。问题： [${question.content}].提问日期：[${question.date}] 部分资料: [${message}]` }]
    }

    logger.debug('------------------发送')
    //console.log(decode(batchTokens))
    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages
        });
        logger.debug('收到information --------------------------')
        //console.log(completion.data.choices[0].message.content)
        logger.debug(completion.data.usage)
        return { information: completion.data.choices[0].message.content, tokens: completion.data.usage.total_tokens }
    } catch (e) {
        logger.debug(e)
        return { information: '', tokens: 0 }
    }
}

const extract_article = async function (article, question, language = "English") {
    const message_batches = split_article(article, 2500, 50)
    const promises = message_batches.map(async (message) => extract_batch(message, question, language));
    const results = await Promise.all(promises);

    logger.debug('---------------------- article extract 完毕-----------------------')
    logger.debug('results')
    let x = { information: [], tokens_: 0 }
    results.forEach((result) => {
        x.information.push(result.information)
        x.tokens_ += result.tokens
    })
    //console.log(x)
    return x
}

module.exports = extract_article;