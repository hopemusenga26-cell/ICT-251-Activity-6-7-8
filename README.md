# Campus Maintenance Requests — ICT251 Activities 6, 7 and 8

ICT251 Web Technologies, Mulungushi University
Musenga Hope Sichula, 202511308

A web system for reporting and tracking campus maintenance problems: broken lights, leaking taps,
damaged furniture and building or grounds issues. The three activities build the same system in
stages, each in its own folder.

| Folder | Activity | What it is | Hosted on |
|---|---|---|---|
| [`activity6-frontend`](activity6-frontend) | 6 — Frontend development | HTML5, CSS and JavaScript interface with browser demonstration data (localStorage) | Netlify |
| [`activity7-backend`](activity7-backend) | 7 — Backend development | Independent Node.js and Express REST API with an SQLite database | Render |
| [`activity8-integration`](activity8-integration) | 8 — Frontend and backend integration | The Activity 6 interface reading and writing records through the Activity 7 API | Netlify |

All three use the same record structure: `id`, `title`, `category`, `description` and `status`
(`Pending`, `In progress` or `Completed`). Each folder has its own README with setup and test steps.

## Live links

| Activity | URL |
|---|---|
| 6 | _to be added_ |
| 7 | _to be added_ |
| 8 | _to be added_ |

## Hosting settings

| Site | Service | Base / root directory | Build command | Publish directory / start |
|---|---|---|---|---|
| Activity 6 | Netlify | `activity6-frontend` | _(none)_ | `activity6-frontend` |
| Activity 7 | Render Web Service | `activity7-backend` | `npm install` | `npm start` |
| Activity 8 | Netlify | `activity8-integration` | _(none)_ | `activity8-integration` |
