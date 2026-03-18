const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');

const globalErrorHandlerMiddleware = require('./common/middlewares/error.middleware')
const notFoundMiddleware = require('./common/middlewares/notFound.middleware')

const app = express();

// Security middlewares
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "*",
        credentials: true
    })
);

// Parsing middlewares
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Utility middlewares
app.use(compression()); 
app.use(morgan('dev'));

// Health check
app.get('/health', (_, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
  });
});

// 404 handler 
app.use(notFoundMiddleware);

// Global error handler 
app.use(globalErrorHandlerMiddleware());


module.exports = app;