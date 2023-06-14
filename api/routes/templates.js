const express = require('express')
const router = express.Router();
const Template = require('../models/template')
const { createNewTemplates } = require('../utils/templates')
const logger = require('../utils/logger')

router.get('/', async (req, res) => {
    logger.debug('----------------GET templates-------------')
    try {
        let templates = await Template.find({ user: req.user._id, deleted: false }).sort({ add_time: 1 })
        if (templates.length === 0) {
            logger.debug('no templates found, creating new templates')
            await createNewTemplates(req.user._id)
            templates = await Template.find({ user: req.user._id }).sort({ add_time: 1 })
        }
        // send templates' title, system, message and _id (as id)
        templates = templates.map(t => {
            return {
                title: t.title,
                system: t.system,
                message: t.message,
                id: t._id
            }
        })
        res.json({ templates })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error })
    }
})

// delete a template
router.get('/delete/:id', async (req, res) => {
    logger.debug('----------------delete templates-------------')
    try {
        let template = await Template.findById(req.params.id)
        if (template) {
            template.deleted = true
            await template.save()
        }
        res.json({ message: 'template deleted' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error })
    }
})


//update a template
router.post('/:id', async (req, res) => {
    logger.debug('----------------POST templates-------------')
    // if the id doesn't exist, create a new template; otherwise, update the existing one
    if (req.isAuthenticated()) {
        try {
            let template = await Template.findById(req.params.id)
            if (!template) {
                logger.debug('template not found, creating new template')
                template = new Template({
                    title: req.body.title,
                    system: req.body.system,
                    message: req.body.message,
                    user: req.user._id,
                    _id: req.params.id
                })
            } else {
                template.title = req.body.title
                template.system = req.body.system
                template.message = req.body.message
            }
            await template.save()
            res.json({ message: 'template updated' })
        } catch (error) {
            console.log(error)
            res.status(500).json({ error })
        }
    }
})




module.exports = router;