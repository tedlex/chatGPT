const chatgpt = require('./chatgpt');
const logger = require('./logger')

const generateTitle = async function (question) {
    let title;
    let messages = [{ role: 'user', content: `Return a very short title of a conversation based on user's first question. Your should return an object, like {"title": "NYC weather"}. The question:${question}` }]
    try {
        const { answer, tokens } = await chatgpt(messages)
        try {
            title = JSON.parse(answer).title;
        } catch (e) {
            title = answer
        }
    } catch (e) {
        logger.debug(e)
        title = 'UNTITLED'
    }
    return title
}

module.exports = generateTitle;