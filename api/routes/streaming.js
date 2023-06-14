const config = require('../config');
const express = require('express')
const router = express.Router();
const Token = require('../models/token')
const Message = require('../models/message')
const Conversation = require('../models/conversation')
const generateTitle = require('../utils/generateTitle')
const logger = require('../utils/logger')
const md = require('../utils/markdown')
const { createParser } = require('eventsource-parser')
const { question2information, url2information } = require('../utils/online');
const { encode, decode } = require('gpt-3-encoder')
const { getDate } = require('../utils/time')
const num_tokens_from_messages = require('../utils/tokens_calc')



const getMessages0 = async function (convMessages) {
    return { messages: convMessages, contentAll: "", tokens: 0 }
}

const getMessages1 = async function (convMessages, res) {
    const question = { content: "", date: getDate(), language: "English" }
    question.content = convMessages[convMessages.length - 1].content

    const result_status = await question2information(question, res)
    logger.debug('--------result_status--------')
    //console.log(result_status)


    result_status.contentAll += '  \n  \n'
    res.write(`data: ${JSON.stringify({ content: md.render(result_status.contentAll) })}\n\n`);

    let messages = [{ role: 'user', content: `We have scraped and extracted some useful information related to a question. Now act like a professional analyst and give the best answer to the client's question given the information you have.  The question is: [${question.content}]. Today: [${question.date}]. The information you have: [${JSON.stringify(result_status.information)}]` }]
    if (result_status.language.toUpperCase() === 'CHINESE') {
        messages = [{ role: 'user', content: `我们已经搜集了与一个问题相关的资料。请根据整合的资料来回答问题。请充分利用所有信息，给出详细的、内容详实的回答。问题: [${question.content}]. 资料: [${JSON.stringify(result_status.information)}]` }]
    }
    logger.debug('------------------发送 final-------')
    logger.debug(messages)
    return { messages, contentAll: result_status.contentAll, tokens: result_status.tokens }
}


const getMessages2 = async function (convMessages, res) {
    const question = { content: "", date: getDate(), language: "English" }
    question.content = convMessages[convMessages.length - 1].content

    const result_status = await url2information(question, res)
    logger.debug('--------result_status--------')
    //console.log(result_status)

    result_status.contentAll += '  \n  \n'
    res.write(`data: ${JSON.stringify({ content: md.render(result_status.contentAll) })}\n\n`);

    let messages = [{ role: 'user', content: `We have scraped and extracted some useful information related to a question. Now act like a professional analyst and give the best answer to the client's question given the information you have. The question is: [${question.content}]. Today: [${question.date}]. The information we have: [${JSON.stringify(result_status.information)}]` }]
    if (result_status.language.toUpperCase() === 'CHINESE') {
        messages = [{ role: 'user', content: `我们已经搜集了与一个问题相关的资料。请根据整合的资料来回答问题。请充分利用所有信息，给出详细的、内容详实的回答。问题: [${question.content}]. 资料: [${JSON.stringify(result_status.information)}]` }]
    }
    logger.debug('------------------发送 final-------')
    logger.debug(messages)
    return { messages, contentAll: result_status.contentAll, tokens: result_status.tokens }
}


router.get('/', async (req, res) => {
    logger.debug('-----------------GET streaming')
    logger.debug(req.headers['x-forwarded-for'])
    logger.debug(req.user)
    logger.debug(req.session)
    let { convMessages, conversationId } = req.session.lastConvMessages
    let savedConversation = await Conversation.findById(conversationId).populate('messages')
    // console.log(`------------------convMessages`)
    // logger.debug(convMessages)

    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');
    if (config.production) {
        res.setHeader('Access-Control-Allow-Origin', '*');
    } else {
        // cors
        res.setHeader('Access-Control-Allow-Origin', config.reactURL);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.flushHeaders();
    res.on('close', () => {
        logger.debug('client dropped me');
        res.end();
    });

    let online = req.query.online
    let messages;
    let contentAll;
    let tokens;
    if (typeof online === "undefined") {
        ({ messages, contentAll, tokens } = await getMessages0(convMessages));
    } else if (online === '1') {
        ({ messages, contentAll, tokens } = await getMessages1(convMessages, res))
    } else if (online === '2') {
        ({ messages, contentAll, tokens } = await getMessages2(convMessages, res))
    }
    try {
        let response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${config.openaiKey}`
                },
                method: "POST",
                body: JSON.stringify({
                    model: savedConversation.settings.model,
                    messages,
                    stream: true
                })
            }
        );
        let _newToken = new Token({
            model: savedConversation.settings.model,
            promptType: 'question',
            conversation: savedConversation._id,
            count: num_tokens_from_messages(messages)
        })
        if (req.user) {
            _newToken.user = req.user._id
        }
        await _newToken.save()

        logger.debug(`ask model: ${savedConversation.settings.model}`)
        function onParse(event) {
            if (event.type === 'event') {
                if (event.data !== "[DONE]") {
                    const content = JSON.parse(event.data).choices[0].delta?.content || ""
                    contentAll = contentAll + content
                    res.write(`data: ${JSON.stringify({ content: md.render(contentAll) })}\n\n`);
                }
            } else if (event.type === 'reconnect-interval') {
                console.log('We should set reconnect interval to %d milliseconds', event.value)
            } else {
                console.log(event)
            }
        }
        const parser = createParser(onParse)
        for await (const value of response.body?.pipeThrough(new TextDecoderStream())) {
            parser.feed(value)
        }
        logger.debug('----------------------  接收完毕-----------------------')
        //console.log(contentAll)
        res.write(`data: ${JSON.stringify({ content: '[CONTENT]', contentAll, contentAll_md: md.render(contentAll) })}\n\n`); // send the original content without md.render
        let newMessage = new Message({
            role: 'assistant',
            content: contentAll
        })
        savedConversation.messages.push(newMessage)
        if (savedConversation.title === 'NEW') {
            let title = await generateTitle(savedConversation.messages[0].content)
            savedConversation.title = title
            // if (!req.isAuthenticated()) {
            //     req.session.tempConvs[0].title = title
            // }
            res.write(`data: ${JSON.stringify({ content: '[TITLE]', title, cid: savedConversation._id })}\n\n`);
        }
        savedConversation.update_time = Date.now()

        let newToken = new Token({
            model: savedConversation.settings.model,
            promptType: 'answer',
            conversation: savedConversation._id,
            count: encode(contentAll).length + tokens
        })
        if (req.user) {
            newToken.user = req.user._id
        }
        if (typeof online !== "undefined") {
            res.write(`data: ${JSON.stringify({ content: '[TOKENS]', count: newToken.count })}\n\n`);
            logger.debug(`total tokens: ${newToken.count}`)
        }
        await newToken.save()
        await newMessage.save();
        await savedConversation.save();
    } catch (e) {
        console.log(e)
        let errorMessage = new Message({
            role: 'assistant',
            content: 'Something is wrong!'
        })
        savedConversation.messages.push(errorMessage)
        await errorMessage.save();
        await savedConversation.save();
        res.write(`data: ${JSON.stringify({ content: md.render("Something is wrong. Please try again.") })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ content: '[DONE]' })}\n\n`);
})


module.exports = router;