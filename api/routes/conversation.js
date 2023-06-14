const express = require('express')
const router = express.Router();
const Conversation = require('../models/conversation')
const Template = require('../models/template')
const Token = require('../models/token')
const Message = require('../models/message')
const md = require('../utils/markdown')
const multer = require('multer')
const upload = multer()
const logger = require('../utils/logger')

router.get('/delete/:id', async (req, res) => {
    try {
        await Conversation.findByIdAndUpdate(req.params.id, {
            deleted: true
        });
        res.send({ message: 'success' })
    } catch (e) {
        res.status(500).send('Internal server error: delete failure');
    }
})

router.get('/archive', async (req, res) => {
    const conversations = await Conversation.find({ user: req.user._id, deleted: false, archived: true }).sort({ add_time: -1 })
    res.render('archive', { conversations })
})

router.get('/archive/:id', async (req, res) => {
    try {
        await Conversation.findByIdAndUpdate(req.params.id, {
            archived: true
        });
        res.send({ message: 'success' })
    } catch (e) {
        res.status(500).send('Internal server error: delete failure');
    }
})


router.post('/title-update/:id', async (req, res) => {
    const { new_title } = req.body
    await Conversation.findByIdAndUpdate(req.params.id, {
        title: new_title
    });
    res.send({ message: 'success' })
})


// export a user's conversation history
router.get('/export', async (req, res) => {
    logger.debug('------------ export --------------')
    let f = { user: req.user._id, conversations: [], templates: [], tokens: [] }

    const conversations = await Conversation.find({ user: req.user._id, deleted: false }).populate('messages')
    conversations.forEach(conversation => {
        let c = { _id: conversation._id, title: conversation.title, messages: [], add_time: conversation.add_time }
        conversation.messages.forEach(message => {
            c.messages.push({ role: message.role, content: message.content })
        })
        f.conversations.push(c)
    })
    const templates = await Template.find({ user: req.user._id, deleted: false })
    templates.forEach(template => {
        f.templates.push({ _id: template._id, title: template.title, system: template.system, message: template.message, add_time: template.add_time })
    })
    const tokens = await Token.find({ user: req.user._id, deleted: false })
    tokens.forEach(token => {
        f.tokens.push({ _id: token._id, model: token.model, promptType: token.promptType, count: token.count, conversation: token.conversation, add_time: token.add_time })
    })

    res.json(f)
})

// import a user's conversation history from a json file uploaded by the user
router.post('/import', upload.single('file'), async (req, res) => {
    logger.debug('------------ import --------------')
    try {
        const f = JSON.parse(req.file.buffer.toString())
        f.conversations.forEach(async conversation => {
            const c = await Conversation.findById(conversation._id)
            if (c && f.user === req.user._id.toString()) {

                if (c.deleted) {
                    await Conversation.findByIdAndUpdate(conversation._id, {
                        deleted: false
                    });
                }

            } else {
                const newConversation = new Conversation({
                    user: req.user._id,
                    title: conversation.title,
                    messages: [],
                    add_time: conversation.add_time
                });

                let messagePromises = conversation.messages.map(async message => {
                    const newMessage = new Message({
                        role: message.role,
                        content: message.content
                    });
                    await newMessage.save();
                    return newMessage._id;
                });

                newConversation.messages = await Promise.all(messagePromises);
                await newConversation.save();
            }
        })
        f.templates.forEach(async template => {
            const t = await Template.findById(template._id)
            if (t && f.user === req.user._id.toString()) {
                if (t.deleted) {
                    t.deleted = false
                    await t.save()
                }
            } else {
                const newTemplate = new Template({
                    user: req.user._id,
                    title: template.title,
                    system: template.system,
                    message: template.message,
                    add_time: template.add_time
                })
                await newTemplate.save()
            }
        })
        f.tokens.forEach(async token => {
            const t = await Token.findById(token._id)
            if (t && f.user === req.user._id.toString()) {
                if (t.deleted) {
                    t.deleted = false
                    await t.save()
                }
            } else {
                const newToken = new Token({
                    user: req.user._id,
                    model: token.model,
                    promptType: token.promptType,
                    count: token.count,
                    conversation: token.conversation,
                    add_time: token.add_time
                })
                await newToken.save()
            }
        })

        return res.json({ message: 'upload success' })
    } catch (e) {
        res.status(500).send('Internal server error: import failure');
    }
})




router.get('/:id', async (req, res) => {
    // TODO: should verify user
    try {
        logger.debug(`--------------------get conversation: ${req.params.id}`)
        logger.debug(req.user)
        const conversation = await Conversation.findById(req.params.id).populate('messages')
        let messages = conversation.messages.map(message => {
            m = message.toObject();
            return {
                role: m.role,
                content: m.content,
                content_md: md.render(m.content)
            }
        })
        res.send({
            messages,
            system_message: conversation.settings.system_message,
            conversation_mode: conversation.settings.conversation_mode,
            conversation_start: conversation.settings.conversation_start,
            model: conversation.settings.model,
            language_mode: conversation.settings.language_mode,
            template: conversation.settings.template,
        })
    } catch (e) {
        console.log('...conversation not found')
        res.status(500).send('Internal server error occurred: conversation not found');
    }
})

module.exports = router;