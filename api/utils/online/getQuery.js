const config = require('../../config');
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: config.openaiKey
});
const openai = new OpenAIApi(configuration);

const getQuery = async function (question) {
    let messages = [{ role: 'user', content: `Today is ${question.date}. Now image you can use google to search for information to answer a question. Think what information you need to know in order to answer the question, then return the search query. You should not care whether it has happened yet or whether you know the answer. Query language should be the same as the question. Return query and language formatted as JSON object. You should only return the JSON no matter what. You should focus on the content of information instead of the final answer's format. For example, if user wants a list or a table or a summary of something, the query should be about something, and should not include list/table/summary.` }, { role: 'assistant', content: "Sure, I can help with that! Please provide me with a sample question for me to demonstrate." }, { role: 'user', content: `The question: [Please summarize the south korean president Yoon Suk Yeol's latest speech in the US congress for me.]` }, { role: 'assistant', content: '{"query": "south korean president addresses US congress", "lang": "English"}' }, { role: 'user', content: 'The question: [can you give me a table of the weather of next 7 days in NYC? (use both Fahrenheit and Celsius)]' }, { role: 'assistant', content: `{"query": "NYC 7-days weather forecast", "lang": "English"}` }, { role: 'user', content: "The question: [习近平和泽连斯基通电话说了什么？]" }, { role: 'assistant', content: `{"query": "习近平泽连斯基通话内容", "lang": "Chinese"}` }, { role: 'user', content: "The question: [It's said that Apple is going to release an VR/AR product, like a glasses or headset. When will it release?]" }, { role: 'assistant', content: `{"query": "Apple AR/VR product launch date", "lang": "English"}` }, { role: 'user', content: "The question: [I heard there was a mass shooting in Texas recently where 5 people died? Tell me more about this.]" }, { role: 'assistant', content: `{"query": "texas shooting 5 died", "lang": "English"}` }, { role: 'user', content: "The question: [what insteresting things happened in met gala 2023?]" }, { role: 'assistant', content: `{"query": "met gala 2023 highlight", "lang": "English"}` }]

    messages.push({ role: 'user', content: `The question: [${question.content}].` })
    let query;
    let tokens_ = 0
    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            temperature: 0.8,
            messages
        });
        tokens_ = completion.data.usage.total_tokens
        //console.log(completion.data.choices[0].message.content)
        try {
            query = JSON.parse(completion.data.choices[0].message.content);
        } catch (e) {
            query = 'NONE'
        }
    } catch (e) {
        query = 'None'
    }


    //console.log(`query: ${query}`)

    return { query, tokens_ }
}

module.exports = getQuery;