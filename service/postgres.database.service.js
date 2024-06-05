const Pool = require('pg-pool');

const pool = new Pool({
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: 5432,
  ssl: process.env.POSTGRES_DB_SSL,
  max: process.env.POSTGRES_DB_MAX_CONNECTIONS, // set pool max size to 20
  idleTimeoutMillis: 600000, // close idle clients after 1 second
  connectionTimeoutMillis: 10000, // return an error after 1 second if connection could not be established
  maxUses: 7500, // close (and replace) a connection after it has been used 7500 times (see below for discussion)
});

pool.on('error', (err) => {
  console.error(`PG Pool error : ${err}`);
});

function connectClient(cb) {
  let incomingClient;
  pool.connect().then((client) => {
    console.log('In CDP, connectClient :: Connected - Pool totalcount is ', pool.totalCount, 'pool idle count is ', pool.idleCount, ' waiting count is ', pool.waitingCount);
    incomingClient = client;
    cb(incomingClient);
  })
    .catch((e) => {
      console.log('Catch block in  CDP connectClient : error is ', e);
    })
    .finally(() => {
      console.log('finally block in CDP connectClient  ');
      if (typeof incomingClient !== 'undefined' && incomingClient !== null) {
        incomingClient.release();
        console.log('In CDP, connectClient :: finally block - Pool totalcount is ', pool.totalCount, 'pool idle count is ', pool.idleCount, ' waiting count is ', pool.waitingCount);
      }
    });
}

const getConnection = async () => pool.connect();

module.exports = {
  connectClient,
  pool,
  getConnection,
};
