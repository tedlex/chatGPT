const express = require('express')
const router = express.Router();
const User = require('../models/user')
const passport = require('passport')
const { createNewTemplates } = require('../utils/templates');
const logger = require('../utils/logger');


router.post('/register', async (req, res, next) => {
    logger.debug('------------register')
    logger.debug(req.body)
    try {
        const { username, password } = req.body
        const user = new User({ username })
        const registeredUser = await User.register(user, password)
        await createNewTemplates(registeredUser._id)

        req.login(registeredUser, err => {
            if (err) {
                console.log('register login err')
                console.log(err)
                return res.json({ message: "ERROR", content: err })
            }
            logger.debug(registeredUser);
            res.json({ message: "SUCCESS", redirectUrl: '/', user: { _id: registeredUser._id, username: registeredUser.username } })
        })
    } catch (e) {
        console.log(`register error: ${e.message}`)
        res.json({ message: "ERROR", content: e.message })
    }
});


router.post('/login', (req, res, next) => {
    logger.debug('----------login')
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.log('authenticate error');
            console.log(err);
            return res.json({ message: 'Authentication failed', redirectUrl: '/login' })
        }
        if (!user) {
            console.log('err: !user')
            return res.json({ message: 'Username or password incorrect!', redirectUrl: '/login' });
        }
        req.logIn(user, function (err) {
            if (err) {
                console.log('login err')
                return res.json({ message: 'Server failed', redirectUrl: '/login' })
            }
            console.log('login!')
            return res.json({ message: 'SUCCESS', redirectUrl: '/', user: { _id: user._id, username: user.username } });
        });
    })(req, res, next);
});



router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) { return res.json({ message: 'ERROR', redirectUrl: '/' }); }
        console.log('log out!')
        return res.json({ message: 'SUCCESS', redirectUrl: '/' });
    })
})


module.exports = router;