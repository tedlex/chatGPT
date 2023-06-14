const Template = require('../models/template')
const config = require('../config')

// create new templates from config 
async function createNewTemplates(uid) {
    const newTemplates = config.templates.map(template => {
        return {
            ...template,
            user: uid
        }
    })
    await Template.insertMany(newTemplates)
}

module.exports = {
    createNewTemplates
}