const logger = require('../logger')

function checkAnswer(arr) {
    let fail = 0
    let valid_info = []
    for (let i = 0; i < arr.length; i++) {
        const words = arr[i].substr(0, Math.min(80, arr[i].length))
        if ((words.includes('no') || words.includes('not') || words.includes("can't") || words.includes("couldn't") || words.includes('cannot')) && (words.includes('information') || words.includes('data'))) {
            logger.debug('no userful information at this part')
            logger.debug(arr[i])
        } else {
            valid_info.push(arr[i])
        }
    }
    return valid_info;
}

module.exports = checkAnswer;

