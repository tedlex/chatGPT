const Token = require('../models/token')
const config = require('../config')

function getLocalTime(t, date = new Date(), zone = 'America/New_York') {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: zone,
        [t]: 'numeric',
        hour12: false
    });
    if (t === 'year') {
        return formatter.format(date)
    } else {
        return formatter.format(date).padStart(2, '0')
    }
}

function getLocalTimeObj(date = new Date(), zone = 'America/New_York') {
    let res = {}
    let ts = ['year', 'month', 'day', 'hour', 'minute']
    ts.forEach(t => {
        res[t] = getLocalTime(t, date, zone)
    })
    return res
}


const queryToken = async function (user, by = 'day', timezone = "America/New_York") {
    let format = "%Y-%m-%d"
    let today = new Date();
    let tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    let startDay = new Date();
    startDay.setDate(today.getDate() - 31);
    if (by === 'hour') {
        format = "%Y-%m-%d %H"
        startDay.setDate(today.getDate() - 5);
    }
    let result = await Token.aggregate([
        {
            $match: {
                user
            }
        },
        {
            $match: {
                add_time: {
                    $gte: startDay,
                    $lt: tomorrow
                }
            }
        },
        {
            $group: {
                _id: {
                    date: {
                        $dateToString: {
                            format,
                            date: "$add_time",
                            timezone
                        }
                    },
                    model: "$model",
                    promptType: "$promptType"
                },
                count: { $sum: "$count" },
            },
        },
        {
            $project: {
                date: "$_id.date",
                model: "$_id.model",
                promptType: "$_id.promptType",
                count: 1,
                _id: 0
            },
        },
    ]);

    return result
}

const generateTimeLabels = function (start, end, by = 'day') {
    let currDate = new Date(start)
    const endDate = new Date(end)
    let labels = []
    if (by === 'day') {
        while (currDate <= endDate) {
            let dateStr = currDate.toISOString().split('T')[0]
            labels.push(dateStr)
            currDate.setDate(currDate.getDate() + 1)
        }
    } else if (by === 'hour') {
        while (currDate <= endDate) {
            for (let i = 0; i < 24; i++) {
                const dateStr = currDate.toISOString().split('T')[0] + ' '
                const hourStr = String(i).padStart(2, '0')
                const time = dateStr + hourStr
                labels.push(time)
            }
            currDate.setDate(currDate.getDate() + 1)
        }
    }
    return labels
}

const generateChartData = function (queryData, start, end, by = 'day') {
    const price = JSON.parse(JSON.stringify(config.price))
    let models = Object.keys(price)
    let labels = generateTimeLabels(start, end, by)
    let resultObj = {}
    labels.forEach(t => {
        resultObj[t] = {}
        models.forEach(model => {
            resultObj[t][model] = 0
        })
    })
    queryData.forEach(row => {
        if (row.date in resultObj) {
            resultObj[row.date][row.model] += row.count / 1000 * price[row.model][row.promptType]
        }
    })

    let resultArray = []
    for (let key in resultObj) {
        let e = { date: key }
        models.forEach(model => {
            e[model] = resultObj[key][model]
        })
        resultArray.push(e)
    }
    return resultArray
}


function getCost(data) {
    const localTimeObj = getLocalTimeObj()
    const yearMonth = `${localTimeObj.year}-${localTimeObj.month}`
    let cost = 0;
    const models = ['gpt-3.5-turbo', 'gpt-4']
    data.forEach(row => {
        if (yearMonth === row.date.slice(0, 7)) {
            cost += row[models[0]]
            cost += row[models[1]]
        }
    })
    return cost
}

function getDate(shift = 0) {
    let today = new Date();
    let d = new Date();
    d.setDate(today.getDate() + shift);
    const localTimeObj = getLocalTimeObj(d)
    return `${localTimeObj.year}-${localTimeObj.month}-${localTimeObj.day}`
}


module.exports = {
    getLocalTimeObj,
    queryToken,
    generateChartData,
    getCost,
    getDate
}