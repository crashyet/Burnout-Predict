require("dotenv").config();
const createConnectionPool = require("@databases/pg");

const connectionString = process.env.DB_URL;

if (!connectionString) {
  console.error("ERROR: DB_URL is not defined in .env file");
}

const db = createConnectionPool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = db;
