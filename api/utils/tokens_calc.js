const { encode, decode } = require('gpt-3-encoder')

function num_tokens_from_messages(messages) {
    if (Array.isArray(messages)) {
        //console.log('calc array:')
        num_tokens = 0
        for (const message of messages) {
            num_tokens += 4
            for (const key in message) {
                num_tokens += encode(message[key]).length
                if (key === 'name') {
                    num_tokens -= 1
                }
            }
        }
        num_tokens += 2
        return num_tokens
    }
    if (typeof messages === "string") {
        //console.log('calc string')
        return encode(messages).length
    }
}

module.exports = num_tokens_from_messages;