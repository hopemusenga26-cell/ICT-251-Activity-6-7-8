# Campus Maintenance Requests — Backend API (Activity 7)

ICT251 Web Technologies, Mulungushi University
Musenga Hope Sichula, 202511308

An independent Node.js and Express REST API for the Campus Maintenance Requests system, where students
report campus faults to the help desk. Records are
stored in a hosted SQLite database on Turso, so they are kept when the server sleeps or restarts. Open the base URL in a browser for the API guide.

## Routes

| Method | Route | Purpose | Success |
|---|---|---|---|
| GET | `/` | API guide | 200 |
| GET | `/health` | Server and database check | 200 (503 if the database fails) |
| GET | `/api/records` | All records, or `[]` | 200 |
| GET | `/api/records/:id` | One record | 200 |
| POST | `/api/records` | Create a record | 201 |
| PUT | `/api/records/:id` | Replace the editable fields | 200 |
| DELETE | `/api/records/:id` | Delete a record → `{"message":"Record deleted."}` | 200 |

Errors are JSON with a `message` field: 400 for invalid input, invalid id or malformed JSON,
404 for a missing record or route, 500 for an unexpected failure.

### POST / PUT body

```json
{
  "title": "Broken classroom light",
  "category": "Electrical",
  "description": "The light in Room B12 does not switch on.",
  "status": "Pending",
  "reporter_name": "Mwila Banda",
  "student_number": "202410215",
  "location": "Room B12, Block B"
}
```

`title` 3–80, `category` 2–40, `description` 5–300 characters after trimming; `status` is
`Pending`, `In progress` or `Completed`. Any `id` in the body is ignored.

The reporter fields are optional, so a body with only the four main fields is accepted. When sent,
`reporter_name` must be 2–80 characters, `student_number` 6–12 digits and `location` 3–100
characters. A missing or blank optional field is saved as `null`; PUT replaces all of them.

## Files

| File | Purpose |
|---|---|
| `server.js` | Express app, CORS, API guide, health route, error handling |
| `routes/records.js` | The five record routes and validation |
| `db.js` | Connects to Turso (or a local SQLite file), creates the table, seeds it once; exports `query(sql, values)` |
| `schema.sql` | `records` table with CHECK rules and an `updated_at` trigger |
| `seed.sql` | Twelve made-up reports, inserted only when the table is empty |
| `.env.example` | Copy to `.env` for local settings |

## Run locally

```bash
npm install
cp .env.example .env
npm start
```

Then open http://localhost:3000. `npm run seed` resets the table to the starting records.

## Environment variables

| Name | Example | Meaning |
|---|---|---|
| `PORT` | `3000` | Port (Render sets this itself) |
| `TURSO_DATABASE_URL` | `libsql://campus-maintenance-<user>.turso.io` | Hosted SQLite database (used online) |
| `TURSO_AUTH_TOKEN` | _(secret from Turso)_ | Token for that database; never commit it |
| `DB_FILE` | `./data/records.db` | Local SQLite file, used only when `TURSO_DATABASE_URL` is empty |
| `CLIENT_ORIGINS` | `https://my-site.netlify.app,http://127.0.0.1:5500` | Browser origins allowed by CORS, comma-separated |

## Deploy on Render

New → Web Service → connect this repository and set **Root Directory** to `activity7-backend`.
Runtime **Node**, build command `npm install`, start command `npm start`, instance **Free**.
Under Environment add `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` and `CLIENT_ORIGINS`.

Free Render services sleep when idle, so the first request can take up to a minute. Render's own
disk is temporary, which is why the records live in the Turso database instead: they are kept
through sleeps, restarts and redeploys. The twelve starting reports are added only when the table is empty.
