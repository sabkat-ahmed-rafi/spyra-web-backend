const pino = require('pino');

const isDev = process.env.NODE_ENV !== 'production';

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    ...(isDev && {
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,                        // Add colors to output
                translateTime: 'SYS:standard',         // Human-readable timestamps
                ignore: 'pid,hostname',                // Hide less useful info
                singleLine: false,                     // Multi-line for better readability
                levelFirst: true,                      // Show level first
                messageFormat: '{msg}',                // Custom message format
                errorLikeObjectKeys: ['err', 'error'], // Format errors nicely
            }
        }
    })
})

module.exports = logger;
