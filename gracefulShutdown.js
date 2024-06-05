const mongoose = require('mongoose');
const { sequelize } = require('./service/postgres.sequelize.database.service');
const poolCoonection = require('./service/postgres.database.service').pool;

const gracefulShutdown = (app) => {
  console.log('Received signal to shutdown');
  // Prevent new connections
  app.close(async () => {
    console.log('Server closed. No longer accepting new connections.');

    // Perform cleanup, finalize ongoing tasks, etc.

    try {
      // Close PostgreSQL connections gracefully
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
    // const activeConnections = sequelize?.connectionManager?.pool?._count;
    // console.log('active connections after exit', activeConnections);
    await mongoose.connection.close().then(() => {
      console.log('Mongoose connection closed successfully');
    })
      .catch((err) => {
        console.error('Error closing Mongoose connection:', err);
      });
    // Exit the process once cleanup is done
    process.exit(0);
  });
  // Forcibly close connections after a certain time (e.g., 30 seconds)
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000); // Adjust the time based on your requirements
};

module.exports = gracefulShutdown;
