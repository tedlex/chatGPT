const express = require('express')
const router = express.Router();
const { queryToken, generateChartData, getCost, getDate } = require('../utils/time')


router.get('/', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login')
    }
    res.render('charts')
})

router.get('/data', async (req, res) => {
    try {
        let result = await queryToken(req.user._id, by = 'day')
        let data = generateChartData(result, getDate(-30), getDate(), by = 'day')
        let cost = getCost(data).toFixed(4)
        let result1 = await queryToken(req.user._id, 'hour')
        let result2 = await queryToken(req.user._id, 'day')
        let data1 = generateChartData(result1, getDate(-2), getDate(), 'hour')
        let data2 = generateChartData(result2, getDate(-30), getDate(), 'day')
        // console.log('-----------------data-------------')
        // console.log(data1)
        // console.log(data2)
        res.send({ data1, data2, cost })
    } catch (e) {
        res.status(500).send('Internal server error: ');
    }
})

router.get('/cost', async (req, res) => {
    let result = await queryToken(req.user._id, by = 'day')
    let data = generateChartData(result, getDate(-30), getDate(), by = 'day')
    let cost = getCost(data).toFixed(4)
    res.send({ cost })
})

module.exports = router;