require('dotenv').config();
const express = require('express');
const app = express();
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');

const PORT = process.env.PORT || 3000;

app.use(logger('dev'));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: false, limit: '20mb' }));
app.use(cookieParser());
app.use(bodyParser.text({ type: '*/xml', limit: '20mb' }));
app.use(express.static('public'));

// Routes
app.use('/api/branches', require('./api/branches/router'));
app.use('/api/incidents', require('./api/incidents/router'));
app.use('/api/auth', require('./api/auth/router'));
app.use('/api/user', require('./api/user/router'));

// Catch 404  ← routes-ийн ДАРАА, listen-ий ӨМНӨ
app.use((req, res, next) => {
    next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
    let err_status = err.status || 500;
    console.error((new Date).toUTCString() + ` ${req.originalUrl} appException:`, err.message);
    return res.status(err_status).json({ success: 0, message: `${err_status}` });
});

// Server listening ← хамгийн сүүлд
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});

// Catch 404
app.use((req, res, next) => {
    next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
    let err_status = err.status || 500;
    console.error((new Date).toUTCString() + ` ${req.originalUrl} appException:`, err.message);
    return res.status(err_status).json({
        success: 0,
        message: `${err_status}`
    });
});

module.exports = app;