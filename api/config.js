module.exports = {
    openaiKey: process.env.OPENAI_KEY || 'your openai key',
    port: process.env.API_PORT || 7496,
    reactURL: "http://localhost:3000",
    production: true,
    mongodbURL: 'mongodb://0.0.0.0:27017/chatApp',

    templates: [
        {
            title: 'Default',
            system: 'You are an AI assistant. Be friendly and professional. Think step by step. Elaborate your answer.',
            message: ''
        },
        {
            title: 'Translator',
            system: 'You are a professional English translator.',
            message: 'Please translate the following text into English: [  ]'
        }
    ],
    price: {
        'gpt-3.5-turbo': {
            'question': 0.002,
            'answer': 0.002
        },
        'gpt-4': {
            'question': 0.03,
            'answer': 0.06
        }
    },
    ggApiKey: process.env.GG_API_KEY || 'your google api key',
    ggCx: process.env.GG_CX || 'Your search engine ID',
}