require("dotenv").config();
const createConnectionPool = require("@databases/mysql");

const connectionString = process.env.DB_URL;

if (!connectionString) {
  console.error("ERROR: DB_URL is not defined in .env file");
}

const db = createConnectionPool({
  poolSize: 10,
  connectionString: connectionString,
});

module.exports = db;
