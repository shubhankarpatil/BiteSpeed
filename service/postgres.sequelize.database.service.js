const Sequelize = require('sequelize');

// establishing database connection
const sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
  host: process.env.POSTGRES_HOST,
  dialect: process.env.POSTGRES_DIALECT,
  operatorsAliases: false,
  logging: false,
  define: {
    freezeTableName: true,
  },
  pool: {
    max: parseInt(process.env.MAX_CONNECTION_SIZE, 10),
    min: parseInt(process.env.MIN_CONNECTION_SIZE, 10),
    acquire: parseInt(process.env.ACQUIRE_TIME_OUT, 10),
    idle: 600000,
  },
});

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

sequelize.afterDisconnect(() => {
  console.error('database connection has been disconnected');
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.Op = Sequelize.Op;
db.QueryTypes = Sequelize.QueryTypes;

db.contacts = require('../model/contacts.model')(sequelize, Sequelize);

module.exports = db;
