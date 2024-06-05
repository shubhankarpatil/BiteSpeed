const express = require('express');
const cors = require('cors');

const { identify } = require('../controller/identify.controller');

module.exports = function (app) {
  app.use(cors({ origin: RegExp(process.env.CORS_URL, 'i'), credentials: true }));

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  app.get('', (req, res) => res.send('Welcome To Customer endpoint'));
  app.post('/identify', identify);
};
