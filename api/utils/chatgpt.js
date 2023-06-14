const config = require('../config');
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: config.openaiKey
});
const openai = new OpenAIApi(configuration);


const chatgpt = async function (messages, model = "gpt-3.5-turbo", temperature = 0.8) {
    const completion = await openai.createChatCompletion({
        model,
        temperature,
        messages
    })
    //console.log(completion.data.choices)
    const tokens = completion.data.usage
    const answer = completion.data.choices[0].message.content
    return { answer, tokens }
}

module.exports = chatgpt
