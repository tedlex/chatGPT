const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TokenSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    conversation: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation'
    },
    model: {
        type: String
    },
    promptType: {
        type: String
    },
    count: {
        type: Number
    },
    add_time: {
        type: Date,
        default: Date.now
    },
    deleted: {
        type: Boolean,
        default: false
    }
})


module.exports = mongoose.model('Token', TokenSchema);
