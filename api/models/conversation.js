const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
    title: {
        type: String,
        default: 'untitled'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    messages: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Message'
        }
    ],
    settings: {
        conversation_mode: {
            type: String,
            default: 'off'
        },
        conversation_start: {
            type: Number,
            default: 0
        },
        model: {
            type: String,
            default: 'gpt-3.5-turbo'
        },
        system_message: {
            type: String,
            default: 'You are an AI assistant. Be friendly and professional. Think step by step. Elaborate your answer.'
        },
        language_mode: {
            type: Number,
            default: 1
        },
        template: {
            type: Schema.Types.ObjectId,
            ref: 'Template'
        }
    },
    add_time: {
        type: Date,
        default: Date.now
    },
    update_time: {
        type: Date,
        default: Date.now
    },
    deleted: {
        type: Boolean,
        default: false
    },
    archived: {
        type: Boolean,
        default: false
    }
})


module.exports = mongoose.model('Conversation', ConversationSchema);
