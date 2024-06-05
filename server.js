/* eslint-disable no-underscore-dangle */
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const chalk = require('chalk');

require('dotenv').config();

require('./startup/routes')(app);

const sequelizeConnection = require('./service/postgres.sequelize.database.service').sequelize;
const gracefulShutdown = require('./gracefulShutdown');

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection happened at', promise, `reason: ${reason}`);
  gracefulShutdown(server);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception happened :${err}`);
  gracefulShutdown(server);
  process.exit(1);
});

process.on('SIGTERM', () => gracefulShutdown(server));
process.on('SIGINT', () => {
  const activeConnections = sequelizeConnection.connectionManager.pool._count;
  console.log('active connections at exit', activeConnections);
  gracefulShutdown(server);
});

const port = process.env.APP_PORT;

server.listen(port, () => {
  console.log(chalk.bold.green(`Listening on port ${port} . . .`));
});
