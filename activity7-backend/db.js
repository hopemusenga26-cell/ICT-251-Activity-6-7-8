// Database connection for the records table.
// Online it uses a hosted SQLite database on Turso, so records survive
// server restarts. Locally, without Turso settings, it uses an SQLite file.
// Exports a small pool-style object: `await pool.query(sql, values)` returns
// `{ rows, rowCount }`, which is what the routes use.
require("dotenv").config({ quiet: true });
const fs = require("fs");
const path = require("path");
const { createClient } = require("@libsql/client");

function connect() {
  if (process.env.TURSO_DATABASE_URL) {
    return {
      client: createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN
      }),
      where: "Turso hosted SQLite"
    };
  }
  const file = path.resolve(__dirname, process.env.DB_FILE || "./data/records.db");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  return { client: createClient({ url: `file:${file}` }), where: file };
}

const { client, where } = connect();

// Convert libSQL rows into plain objects keyed by column name.
function toObjects(result) {
  return result.rows.map(row =>
    Object.fromEntries(result.columns.map((name, i) => [name, row[i]]))
  );
}

// Run one SQL statement with ? placeholders and an array of values.
// The values are sent separately from the SQL text.
async function query(sql, values = []) {
  const result = await client.execute({ sql, args: values });
  const rows = toObjects(result);
  return { rows, rowCount: result.columns.length ? rows.length : result.rowsAffected };
}

function readFile(name) {
  return fs.readFileSync(path.join(__dirname, name), "utf8");
}

// Create the table if needed, then add the starting records only when it is empty.
async function setup({ reset = false } = {}) {
  if (reset) await client.execute("DROP TABLE IF EXISTS records");
  await client.executeMultiple(readFile("schema.sql"));
  const { rows } = await query("SELECT COUNT(*) AS count FROM records");
  if (Number(rows[0].count) === 0) await client.executeMultiple(readFile("seed.sql"));
  const after = await query("SELECT COUNT(*) AS count FROM records");
  return Number(after.rows[0].count);
}

if (require.main === module) {
  // `npm run seed` resets the table to the starting records.
  setup({ reset: true })
    .then(count => console.log(`Database reset (${where}) with ${count} records.`))
    .catch(error => { console.error(error); process.exit(1); });
}

module.exports = { query, setup, where };
