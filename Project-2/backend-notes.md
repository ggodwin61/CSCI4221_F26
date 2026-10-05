# Project 2 — Backend Progress Notes

**Contributor:** Garret Godwin  
**Group:** 1  
**Sprint:** 2 — Project 2  
**Development environment:** DragonOS  
**Status:** Backend prototype development started September 29, 2026

## My responsibility and starting point

At our September 22 meeting, I agreed to handle backend development for the campus map application. At our September 29 meeting, I started backend development using Node.js and SQLite.

Both meetings ran from 10:45 a.m. to 11:45 a.m. The meeting minutes record my progress at each meeting; the following description summarizes the broader backend work discussed during development, rather than claiming everything was completed during the September 29 meeting.

## Backend prototype

My backend work on DragonOS uses Node.js with Express and SQLite. The prototype is intended to demonstrate how the campus map can store and retrieve information for the frontend.

The supplied source and database confirm a building → floor → indoor location structure, with Billy C. Black Building as the initial example and support for its three floors. Indoor locations can represent rooms, offices, labs, restrooms, stairs, elevators, and entrances. Detailed campus and room data should be verified before use in the final application.

## What I built with Node.js and Express

I organized the backend into two main JavaScript files. In `server.js`, I imported Express and the database connection, created the application, enabled `express.json()` so the server can read JSON request bodies, and configured the server to listen on port 3000. The root route returns a message showing that the backend is running.

I added routes to list buildings, retrieve a building by ID, search for buildings, add new buildings, and update existing building information. The building search reads the `q` query parameter and matches it against building names and codes using SQL `LIKE`. I placed the search route before the building-ID route so that `search` is treated as a search request.

I also added routes to retrieve a building's floors, retrieve the indoor locations on a selected floor, and add locations to a floor. The floor response is ordered by floor number; the indoor-location response is ordered by room number and name. The server returns JSON so a future frontend can use the responses to populate the campus map and floor views.

For write requests, I added checks for required fields. Building creation and updates require a name, latitude, and longitude. Adding an indoor location requires a name and type. Successful creation returns HTTP 201 with the new record ID. Missing required information returns HTTP 400, missing individual buildings return HTTP 404, and database failures return HTTP 500.

## What I built with SQLite

In `database.js`, I opened `campus.db` through the Node.js `sqlite3` package and added `CREATE TABLE IF NOT EXISTS` statements for three related tables:

| Table | Fields and purpose |
| --- | --- |
| `buildings` | Auto-incrementing ID, name, code, description, latitude, and longitude; stores the campus buildings |
| `floors` | Auto-incrementing ID, building ID, floor number, name, and map layer; links each floor to a building |
| `locations` | Auto-incrementing ID, floor ID, name, room number, type, description, x position, and y position; represents places within a floor |

I defined a unique constraint on the combination of building ID and floor number to prevent duplicate floor numbers within the same building. I declared foreign keys from floors to buildings and from locations to floors, with cascading deletion in the schema. Enforcing those relationships at runtime still requires enabling SQLite foreign keys in the connection.

The API uses `db.all()` for lists, `db.get()` for one building, and `db.run()` for inserts and updates. SQL requests use `?` placeholders with separate parameter values. Insert callbacks use `this.lastID` to return the newly created ID, and the building-update callback uses `this.changes` to determine whether an existing record was updated.

The database I supplied contains Billy C. Black Building with code BCB and its First, Second, and Third Floor records. I have created the indoor-location table and its routes, but this copy of the database does not contain indoor-location records yet.

## How the pieces work together

For a building-search request, Express receives the search text, the server passes a parameterized query to SQLite, and the callback sends the matching database records back as JSON. The same approach supports choosing a building, loading its floors, and retrieving the locations for a selected floor. This is the backend structure intended to support our campus map prototype.

## API work verified in the supplied source

| Endpoint | Purpose |
| --- | --- |
| `GET /api/buildings` | Retrieve campus buildings |
| `GET /api/buildings/:id` | Retrieve one building |
| `GET /api/buildings/search?q=SEARCH` | Search by building name or code |
| `GET /api/buildings/:id/floors` | Retrieve a building's floors |
| `GET /api/floors/:floorId/locations` | Retrieve indoor locations for a floor |
| `POST /api/floors/:floorId/locations` | Add an indoor location to a floor |

The supplied archive contains these routes plus building creation and update routes. JavaScript syntax checks passed, and database inspection verified Billy C. Black Building and three floors. There are no indoor-location records yet. Live HTTP testing remains pending. See [backend_prototype.md](backend_prototype.md) for the full verified inventory.

## How my prototype supports the product

A user could search for Billy C. Black Building, select the building, choose a floor, and view the locations on that floor. My backend supplies the building, floor, and location data needed to support that interface.

The Figma design shows the interface. The backend prototype demonstrates the application's data structure and API approach. Frontend integration remains a separate step to verify.

## Submission evidence and next steps

- [x] Record my backend responsibility from September 22.
- [x] Record that Node.js/SQLite development started September 29.
- [x] Copy the actual DragonOS backend source files into this Project-2 folder.
- [ ] Commit and push the Project-2 folder to the submission repository.
- [x] Document dependency installation with `npm ci` and startup with `node server.js`.
- [ ] Verify API responses and include test output or screenshots.
- [ ] Document current limitations and remaining integration work.

A browser-based backend demo was suggested in the earlier discussion. It is a possible follow-up, not a confirmed completed deliverable.
