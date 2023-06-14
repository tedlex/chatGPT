const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TemplateSchema = new Schema({
    title: {
        type: String,
        default: 'untitled'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    system: {
        type: String,
        default: ''
    },
    message: {
        type: String,
        default: ''
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
    }
})

module.exports = mongoose.model('Template', TemplateSchema);