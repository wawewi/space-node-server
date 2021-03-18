const express = require('express');

require('./db/mongoose');
const userRouter = require('./routers/user');
const spaceRouter = require('./routers/space');

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(spaceRouter);

module.exports = app;