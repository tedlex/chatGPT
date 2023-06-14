// const winston = require('winston');
const config = require('../config');

// const logger = winston.createLogger({
//     level: 'debug',
//     format: winston.format.combine(
//         winston.format.timestamp(),
//         winston.format.printf(({ level, message, timestamp }) => {
//             return message;
//         })
//     ),
//     transports: [
//         new winston.transports.Console()
//     ]
// });



class MyLogger {
    constructor(production) {
        this.production = production;
    }

    debug(message) {
        if (!this.production) {
            console.log(message)
        }
    }

    info(message) {
        console.log(message)
    }

}

const logger = new MyLogger(config.production)

// if (config.production === 'TRUE') {
//     logger.level = 'info';
// }

module.exports = logger;