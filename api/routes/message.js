const express = require('express')
const router = express.Router();
const Message = require('../models/message')
const Conversation = require('../models/conversation')
const Template = require('../models/template')
const logger = require('../utils/logger')


router.post('/', async (req, res) => {
    // TODO: check user login; exist in user databse; include conversationId;
    logger.debug('---------------- POST MESSAGE -------------')
    // console.log(req.session)
    // console.log(req.body)
    let { convMessages, conversationMode: conversation, conversationStart: start, model, conversationId, systemText: introText, selectedTemplate: templateId } = req.body;
    let savedConversation;
    if (conversationId === 'NEW') {
        const newConversation = new Conversation({
            title: 'NEW'
        })
        if (req.user && req.user.username !== '') {
            newConversation.user = req.user._id
        }
        savedConversation = await newConversation.save();
        conversationId = savedConversation._id
    }
    savedConversation = await Conversation.findById(conversationId).populate('messages')
    savedConversation.settings.model = model
    try {
        let template = await Template.findOne({ _id: templateId, deleted: false })
        if (template) {
            savedConversation.settings.template = template._id
        }
    } catch (error) {
        logger.debug(`template ${templateId} not exist`)
    }
    savedConversation.settings.conversation_mode = conversation
    //savedConversation.settings.language_mode = lang
    const newMessage = new Message({
        role: 'user',
        content: convMessages.slice(-1)[0].content
    })
    savedConversation.messages.push(newMessage)
    await newMessage.save();
    await savedConversation.save();

    if (introText.trim().length > 0 && introText.trim().toLowerCase() !== 'null') {
        convMessages.unshift({ role: 'system', content: introText })
    }

    req.session.lastConvMessages = { convMessages, conversationId } // steaming can only use GET, so they need this 

    res.send({ conversationId });
})

module.exports = router;