// Opens the SQLite database, creates the records table and adds the
// starting records once. Exports a small pool-style object so the routes
// can call `await pool.query(sql, values)` and read `result.rows`.
require("dotenv").config({ quiet: true });
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dbFile = path.resolve(__dirname, process.env.DB_FILE || "./data/records.db");
fs.mkdirSync(path.dirname(dbFile), { recursive: true });

const db = new Database(dbFile);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function runFile(name) {
  db.exec(fs.readFileSync(path.join(__dirname, name), "utf8"));
}

// Create the table, then seed it only if it has no rows yet.
function setup({ reset = false } = {}) {
  if (reset) db.exec("DROP TABLE IF EXISTS records;");
  runFile("schema.sql");
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM records").get();
  if (count === 0) runFile("seed.sql");
}

// Run one SQL statement with ? placeholders and an array of values.
// The values are bound separately from the SQL text.
async function query(sql, values = []) {
  const statement = db.prepare(sql);
  if (statement.reader) {
    const rows = statement.all(values);
    return { rows, rowCount: rows.length };
  }
  const info = statement.run(values);
  return { rows: [], rowCount: info.changes };
}

if (require.main === module) {
  // `npm run seed` resets the table to the starting records.
  setup({ reset: true });
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM records").get();
  console.log(`Database reset at ${dbFile} with ${count} records.`);
} else {
  setup();
}

module.exports = { query, file: dbFile };
