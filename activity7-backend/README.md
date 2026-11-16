# Campus Maintenance Requests — Backend API (Activity 7)

ICT251 Web Technologies, Mulungushi University
Musenga Hope Sichula, 202511308

An independent Node.js and Express REST API for the Campus Maintenance Requests system, storing
records in SQLite. Open the base URL in a browser for the API guide.

## Routes

| Method | Route | Purpose | Success |
|---|---|---|---|
| GET | `/` | API guide | 200 |
| GET | `/health` | Server and database check | 200 (503 if the database fails) |
| GET | `/api/records` | All records, or `[]` | 200 |
| GET | `/api/records/:id` | One record | 200 |
| POST | `/api/records` | Create a record | 201 |
| PUT | `/api/records/:id` | Replace the four editable fields | 200 |
| DELETE | `/api/records/:id` | Delete a record → `{"message":"Record deleted."}` | 200 |

Errors are JSON with a `message` field: 400 for invalid input, invalid id or malformed JSON,
404 for a missing record or route, 500 for an unexpected failure.

### POST / PUT body

```json
{
  "title": "Broken classroom light",
  "category": "Electrical",
  "description": "The light in Room B12 does not switch on.",
  "status": "Pending"
}
```

`title` 3–80, `category` 2–40, `description` 5–300 characters after trimming; `status` is
`Pending`, `In progress` or `Completed`. Any `id` in the body is ignored.

## Files

| File | Purpose |
|---|---|
| `server.js` | Express app, CORS, API guide, health route, error handling |
| `routes/records.js` | The five record routes and validation |
| `db.js` | Opens SQLite, creates the table, seeds it once; exports `query(sql, values)` |
| `schema.sql` | `records` table with CHECK rules and an `updated_at` trigger |
| `seed.sql` | Ten made-up records, inserted only when the table is empty |
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
| `DB_FILE` | `./data/records.db` | SQLite database file |
| `CLIENT_ORIGINS` | `https://my-site.netlify.app,http://127.0.0.1:5500` | Browser origins allowed by CORS, comma-separated |

## Deploy on Render

New → Web Service → connect this repository. Runtime **Node**, build command `npm install`,
start command `npm start`, instance **Free**. Add `CLIENT_ORIGINS` (and optionally `DB_FILE`)
under Environment.

Free Render services sleep when idle, so the first request can take up to a minute. Their local
disk is temporary: when the service restarts, the SQLite file is re-created with the ten starting
records, and records added after the last restart are not kept.
