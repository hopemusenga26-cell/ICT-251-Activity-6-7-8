# Campus Maintenance Requests — ICT251 Activities 6, 7 and 8

ICT251 Web Technologies, Mulungushi University
Musenga Hope Sichula, 202511308

A fault reporting system for students. Any student can report a problem on campus, such as a dead
socket, a leaking tap, damaged furniture or a faulty appliance. The report goes to the Campus Help
Desk, which moves it from Pending to In progress to Completed, so the student can track it until it
is fixed. The three activities build the same system in stages, each in its own folder.

| Folder | Activity | What it is | Hosted on |
|---|---|---|---|
| [`activity6-frontend`](activity6-frontend) | 6 — Frontend development | HTML5, CSS and JavaScript interface with browser demonstration data (localStorage) | Netlify |
| [`activity7-backend`](activity7-backend) | 7 — Backend development | Independent Node.js and Express REST API with a hosted SQLite database (Turso) | Render |
| [`activity8-integration`](activity8-integration) | 8 — Frontend and backend integration | The Activity 6 interface reading and writing records through the Activity 7 API | Netlify |

All three use the same record structure:

| Field | Rule | Required |
|---|---|---|
| `id` | Positive whole number, generated, not editable | — |
| `title` | 3 to 80 characters | Yes |
| `category` | 2 to 40 characters (Electrical, Plumbing, Furniture, Appliances, IT & Network, Building & Grounds, Other) | Yes |
| `description` | 5 to 300 characters | Yes |
| `status` | `Pending`, `In progress` or `Completed` | Yes |
| `reporter_name` | 2 to 80 characters | On the website form |
| `student_number` | 6 to 12 digits | On the website form |
| `location` | 3 to 100 characters | On the website form |

The API accepts a body with only the four main fields, so the reporter fields are optional there;
the website form asks for all of them. Each folder has its own README with setup and test steps.

## Live links

| Activity | URL |
|---|---|
| 6 | https://campus-maintenance-a6-202511308.netlify.app |
| 7 | https://campus-maintenance-api-202511308.onrender.com |
| 8 | https://campus-maintenance-a8-202511308.netlify.app |

## Hosting settings

| Site | Service | Base / root directory | Build command | Publish directory / start |
|---|---|---|---|---|
| Activity 6 | Netlify | `activity6-frontend` | _(none)_ | `activity6-frontend` |
| Activity 7 | Render Web Service | `activity7-backend` | `npm install` | `npm start` |
| Activity 8 | Netlify | `activity8-integration` | _(none)_ | `activity8-integration` |
