const { sequelize } = require('./service/postgres.sequelize.database.service');
const poolCoonection = require('./service/postgres.database.service').pool;

const gracefulShutdown = (app) => {
  console.log('Received signal to shutdown');
  app.close(async () => {
    console.log('Server closed. No longer accepting new connections.');

    try {
      await poolCoonection.end();
      console.log('PostgreSQL pg-pool connections released.');
    } catch (error) {
      console.error('Error releasing PostgreSQL connections:', error);
    }

    await sequelize.close()
      .then(() => {
        console.log('Sequelize connection closed.');
      })
      .catch((error) => {
        console.error('Error closing Sequelize connection:', error);
      });

    process.exit(0);
  });

  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

module.exports = gracefulShutdown;
