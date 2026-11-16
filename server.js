// Campus Maintenance Requests API: Express app, CORS, API guide,
// health check, record routes and JSON error handling.
require("dotenv").config({ quiet: true });
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
app.set("trust proxy", 1); // Render sits behind a proxy; keeps https in the guide's URLs.

const origins = (process.env.CLIENT_ORIGINS || "")
  .split(",").map(value => value.trim()).filter(Boolean);
app.use(cors({ origin: origins }));
app.use(express.json({ limit: "20kb" }));

const PROJECT = "Campus Maintenance Requests";
const STUDENT = "Musenga Hope Sichula";
const STUDENT_NO = "202511308";

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// GET /: a readable API guide for the marker.
app.get("/", (req, res) => {
  const base = escapeHtml(`${req.protocol}://${req.get("host")}`);
  const example = escapeHtml(JSON.stringify({
    title: "Broken classroom light",
    category: "Electrical",
    description: "The light in Room B12 does not switch on.",
    status: "Pending"
  }, null, 2));
  res.type("html").send(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${PROJECT} API</title>
<style>
  :root { --navy:#0D1B2E; --surface:#14263F; --line:#2A3F5F; --yellow:#FFC629; --grey:#A7B3C4; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--navy); color:var(--grey); font:1rem/1.6 "Segoe UI", Arial, sans-serif; }
  main { width:min(960px, 100% - 2rem); margin:0 auto; padding:2.5rem 0 3rem; }
  h1, h2 { color:#fff; line-height:1.15; }
  h1 { font-size:clamp(1.9rem, 5vw, 2.8rem); margin:0 0 .4rem; }
  h1 span { color:var(--yellow); }
  h2 { font-size:1.35rem; margin:2.2rem 0 .7rem; }
  a { color:var(--yellow); }
  code, pre { font-family: Consolas, "Courier New", monospace; }
  code { color:#fff; }
  pre { background:var(--surface); border:1px solid var(--line); border-radius:12px; padding:1rem; overflow-x:auto; color:#fff; }
  .card { background:var(--surface); border:1px solid var(--line); border-radius:14px; padding:1.1rem 1.3rem; }
  .table-wrap { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; background:var(--surface); border-radius:12px; overflow:hidden; }
  th, td { text-align:left; padding:.65rem .8rem; border-bottom:1px solid var(--line); vertical-align:top; }
  th { color:#fff; background:#1C3354; }
  .m { display:inline-block; min-width:4.5rem; font-weight:700; color:var(--navy); background:var(--yellow); border-radius:999px; padding:.05rem .6rem; text-align:center; font-size:.85rem; }
  .links { display:flex; flex-wrap:wrap; gap:.6rem; margin-top:1rem; }
  .links a { display:inline-block; padding:.5rem 1rem; border-radius:999px; background:var(--yellow); color:var(--navy); font-weight:700; text-decoration:none; }
  .links a.alt { background:#1C3354; color:#fff; border:1px solid #284470; }
</style>
</head>
<body>
<main>
  <h1>${PROJECT} <span>API</span></h1>
  <p>A REST API for reporting and tracking campus maintenance problems such as broken lights, leaking taps and damaged furniture. Records are stored in an SQLite database.</p>
  <div class="card">
    <p><strong style="color:#fff">Project:</strong> ${PROJECT}<br>
    <strong style="color:#fff">Student:</strong> ${STUDENT}, student number ${STUDENT_NO}<br>
    <strong style="color:#fff">Course:</strong> ICT251 Web Technologies, Activity 7<br>
    <strong style="color:#fff">Base URL:</strong> <code>${base}</code></p>
    <div class="links">
      <a href="/health">Check /health</a>
      <a class="alt" href="/api/records">Open /api/records</a>
    </div>
  </div>

  <h2>Routes</h2>
  <div class="table-wrap"><table>
    <thead><tr><th>Method</th><th>Route</th><th>Purpose</th><th>Success</th></tr></thead>
    <tbody>
      <tr><td><span class="m">GET</span></td><td><code>/</code></td><td>This API guide</td><td>200</td></tr>
      <tr><td><span class="m">GET</span></td><td><code>/health</code></td><td>Check that the server and database respond</td><td>200</td></tr>
      <tr><td><span class="m">GET</span></td><td><code>/api/records</code></td><td>Read all records (an array, or <code>[]</code>)</td><td>200</td></tr>
      <tr><td><span class="m">GET</span></td><td><code>/api/records/:id</code></td><td>Read one record</td><td>200</td></tr>
      <tr><td><span class="m">POST</span></td><td><code>/api/records</code></td><td>Create a record; returns it with its new id</td><td>201</td></tr>
      <tr><td><span class="m">PUT</span></td><td><code>/api/records/:id</code></td><td>Replace all four editable fields; returns the record</td><td>200</td></tr>
      <tr><td><span class="m">DELETE</span></td><td><code>/api/records/:id</code></td><td>Delete a record; returns <code>{"message":"Record deleted."}</code></td><td>200</td></tr>
    </tbody>
  </table></div>

  <h2>Input fields</h2>
  <div class="table-wrap"><table>
    <thead><tr><th>Field</th><th>Rule</th></tr></thead>
    <tbody>
      <tr><td><code>title</code></td><td>Text, 3 to 80 characters after trimming spaces</td></tr>
      <tr><td><code>category</code></td><td>Text, 2 to 40 characters, e.g. Electrical, Plumbing, Furniture, Building &amp; Grounds</td></tr>
      <tr><td><code>description</code></td><td>Text, 5 to 300 characters</td></tr>
      <tr><td><code>status</code></td><td>Exactly one of <code>Pending</code>, <code>In progress</code>, <code>Completed</code></td></tr>
    </tbody>
  </table></div>
  <p><code>id</code> is generated by the database. Do not send it; any id in the body is ignored.</p>

  <h2>Valid POST and PUT body</h2>
  <p>Send with the header <code>Content-Type: application/json</code>. PUT needs all four fields and does not create a missing record.</p>
  <pre>${example}</pre>

  <h2>Status codes</h2>
  <div class="table-wrap"><table>
    <thead><tr><th>Code</th><th>Meaning</th></tr></thead>
    <tbody>
      <tr><td>200</td><td>Success (GET, PUT, DELETE)</td></tr>
      <tr><td>201</td><td>Record created (POST)</td></tr>
      <tr><td>400</td><td>Invalid input, invalid id or malformed JSON</td></tr>
      <tr><td>404</td><td>Record or route does not exist</td></tr>
      <tr><td>500</td><td>Unexpected server failure</td></tr>
      <tr><td>503</td><td>Database not responding (from <code>/health</code>)</td></tr>
    </tbody>
  </table></div>
  <p>Every error is JSON with a <code>message</code> field, for example <code>{"message":"Title must have 3 to 80 characters."}</code></p>

  <h2>Notes</h2>
  <p>This service runs on a free hosting plan. If it has been idle, the first request can take up to a minute while it starts. The ten starting records are made up.</p>
</main>
</body>
</html>`);
});

// GET /health: confirm the database answers a query.
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1 AS ok");
    res.status(200).json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(503).json({ status: "error", message: "The database is not responding." });
  }
});

app.use("/api/records", require("./routes/records"));

// Unknown routes.
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} does not exist.` });
});

// Error handler: malformed JSON is 400, anything else is 500.
app.use((error, req, res, next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Request body must be valid JSON." });
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({ message: "Request body is too large." });
  }
  console.error(error);
  res.status(500).json({ message: "Something went wrong on the server. Please try again." });
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port}`);
});
