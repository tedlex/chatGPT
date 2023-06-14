const mongoose = require('mongoose');

const User = require('../user');
const Template = require('../template');
const Conversation = require('../conversation');

mongoose.connect('mongodb://0.0.0.0:27017/chatApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

// For each user in database, create a default template.
async function createDefaultTemplate() {
    const users = await User.find();
    for (let user of users) {
        const newTemplate = new Template({
            title: 'Default',
            user: user._id,
            system: 'You are an AI assistant. Be friendly and professional. Think step by step. Elaborate your answer.',
            message: ''
        })
        await newTemplate.save();
        const newTemplate2 = new Template({
            title: 'Translator',
            user: user._id,
            system: 'You are a professional English translator.',
            message: 'Please translate the following text into English: []'
        })
        await newTemplate2.save();
    }
}


async function setTemplate() {
    // Find all conversations in the database.
    const conversations = await Conversation.find();
    for (let conversation of conversations) {
        // If it doesn't have settings.template, find its user and set settings.template to the user's first template by add_time. 
        if (!conversation.settings.template) {
            if (conversation.user) {
                const user = await User.findById(conversation.user);
                const templates = await Template.find({ user: user._id, deleted: false }).sort({ add_time: 1 });
                if (templates.length > 0) {
                    conversation.settings.template = templates[0]._id;
                    await conversation.save();
                } else {
                    // If the conversation has a user, but the user doesn't have any templates, create a new default template, set settings.template to the new template, and add the new template to the user's templates.

                    const newTemplate = new Template({
                        title: 'Default',
                        user: conversation.user._id,
                        system: 'You are an AI assistant. Be friendly and professional. Think step by step. Elaborate your answer.',
                        message: ''
                    })
                    await newTemplate.save();
                    conversation.settings.template = newTemplate._id;
                    await conversation.save();
                }

            } else {
                // If the conversation doesn't have a user, create a new template and set settings.template to the new template.
                const newTemplate = new Template({
                    title: 'Default',
                    system: 'You are an AI assistant. Be friendly and professional. Think step by step. Elaborate your answer.',
                    message: ''
                })
                await newTemplate.save();
                conversation.settings.template = newTemplate._id;
                await conversation.save();
            }
        }
    }
}

async function main() {
    console.log('Running addTemplates.js');
    console.log('Creating default templates...');
    await createDefaultTemplate();
    console.log('Setting templates for conversations...');
    await setTemplate();
    mongoose.disconnect();
}

main();