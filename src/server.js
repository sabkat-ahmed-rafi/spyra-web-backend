process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

require('dotenv').config();

const app = require('./app');
const { closeDB, connectDB } = require('./config/db');
const logger = require('./config/logger');

const PORT = process.env.PORT || 5000;
const SHUTDOWN_TIMEOUT = 10000;

let server;
let isSuttingDown = false;

const gracefulShutdown = async (signal, error = null, exitCode = 0) => {
    if(isSuttingDown) {
        logger.warn({ signal }, 'Shitdown already in progress');
        return;
    }

    isSuttingDown = true;

    try {

        if (error) {
            logger.error({ err: error, signal }, `${signal} received due to error`);
        } else {
            logger.info({ signal }, `${signal} received. Starting graceful shutdown`);
        }

        const forceShutdownTimer = setTimeout(() => {
            logger.fatal(
                { signal, timeout: SHUTDOWN_TIMEOUT },
                'Force shutdown due to timeout'
            );
            process.exit(1);
        }, SHUTDOWN_TIMEOUT);

        // Make the timer not block the event loop
        forceShutdownTimer.unref();

        // 1) Stop accepting new HTTP requests
        if(server) {
            await new Promise((resolve, reject) => {
                server.close((err) => {
                    if(err) return reject(err);
                    logger.info('HTTP server closed');
                    resolve();
                });
            });
        }

        // 2) Close Sequelize DB connection
        await closeDB();

        clearTimeout(forceShutdownTimer);
        logger.info({ exitCode }, 'Graceful shutdown completed');
        process.exit(exitCode);

    } catch(shutdownError) {
        logger.fatal(
        { err: shutdownError, signal },
        'Error during graceful shutdown'
        );
        process.exit(1);
    }
};


const bootstrap = async () => {
    try {

        await connectDB();

        server = app.listen(PORT, () => {
            logger.info({ port: PORT }, 'Server started successfully');
        })

        server.keepAliveTimeout = 65000;
        server.headersTimeout = 66000;

    } catch (error) {
        logger.fatal({ err: error }, 'Failed to bootstrap application');
        process.exit(1);
    }
}

bootstrap();

process.on('unhandledRejection', (err) => {
  gracefulShutdown('UNHANDLED_REJECTION', err, 1);
});

process.on('SIGTERM', () => {
  gracefulShutdown('SIGTERM', null, 0);
});

process.on('SIGINT', () => {
  gracefulShutdown('SIGINT', null, 0);
});