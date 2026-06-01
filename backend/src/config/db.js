require("dotenv").config();
const createConnectionPool = require("@databases/pg");
const pg = require("pg");

// Configure pg to parse TIMESTAMP without timezone columns as Asia/Jakarta (WIB, UTC+7) local time,
// which prevents timezone shift bugs when deployed to platforms like Vercel (running in UTC).
pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, (stringValue) => {
  if (!stringValue) return null;
  const isoStr = stringValue.replace(" ", "T") + "+07:00";
  return new Date(isoStr);
});

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
