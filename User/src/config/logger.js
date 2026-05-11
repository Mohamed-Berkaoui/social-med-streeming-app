const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',

    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),

    transports: [
        // Console
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),

        // All logs
        new winston.transports.File({
            filename: 'logs/app.log'
        }),

        // Only error logs 
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error'
        })
    ]
});

module.exports = logger;