# Campus Maintenance Requests — Complete System (Activity 8)

ICT251 Web Technologies, Mulungushi University
Musenga Hope Sichula, 202511308

The Activity 6 frontend connected to the Activity 7 Node.js API. Adding, viewing, editing and
deleting fault reports on the page now reads and writes the shared SQLite database through the API,
so the same records appear on any device.

## What changed from Activity 6

| File | Change |
|---|---|
| `js/config.js` | Exports `API_BASE_URL`: the live backend, or `http://localhost:3000` when the page runs on this computer |
| `js/data.js` | Same `recordService` methods, now calling the API with `fetch` and checking `response.ok`; localStorage records and seeding removed |
| `js/app.js` | Shows "Loading records", disables Save while a request runs, shows success only after the backend confirms, keeps the input on failure |
| `index.html` | About section with usage steps and links to the API guide and `/health` |

Reports include the reporter's name, student number and location, which the API saves with the
fault details.

The colour theme choice is still remembered in the browser; records are not.

## Run locally

1. Start the backend (`npm start` in `activity7-backend`).
2. Open this folder with Live Server. The page uses `http://localhost:3000` automatically.

## Before publishing

1. Set `LIVE_API_URL` in `js/config.js` to the live backend URL (HTTPS, no final slash).
2. Add this site's origin, e.g. `https://my-site.netlify.app`, to the backend's `CLIENT_ORIGINS`
   on Render and redeploy the backend.

## How to test

1. Send a report → it appears on the page and at `/api/records`.
2. Edit it and save → the change appears at `/api/records/:id` with the same id.
3. Delete it after confirming → `/api/records/:id` returns 404.
4. Stop the backend and try to send a report → a clear error appears and the typed values stay.
5. Open the site on another device → the same reports load.
