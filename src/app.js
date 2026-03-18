const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');

const app = express();

// Security middlewares
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "*",
    })
);

// Parsing middlewares
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Utility middlewares
app.use(compression()); 
app.use(morgan('dev'));


module.exports = app;