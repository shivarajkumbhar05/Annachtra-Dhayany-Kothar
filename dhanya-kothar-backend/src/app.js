const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

const configuredOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((origin) => origin.trim());
const developmentOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const allowedOrigins = [...new Set([...configuredOrigins, ...developmentOrigins])];

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
