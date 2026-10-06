# Backend Prototype — Campus Map Application

**Developer:** Garret Godwin  
**Group:** 1  
**Sprint:** 2 — Project 2

## Purpose and my contribution

My prototype demonstrates how the campus map application can organize and provide building and indoor-location information for a single-floor interface. I took responsibility for backend development at the September 22 meeting and started development using Node.js and SQLite on September 29. I worked in DragonOS.

## Technology and files

- Node.js: server runtime.
- Express: HTTP routes and JSON responses.
- SQLite, through the `sqlite3` package: persistent campus data.
- [server.js](school-map-backend/server.js): server and API routes.
- [database.js](school-map-backend/database.js): database connection and table definitions.
- [campus.db](school-map-backend/campus.db): supplied prototype database.
- [package.json](school-map-backend/package.json) and lockfile: dependency configuration.

Install and run instructions are in the [backend README](school-map-backend/README.md).

## Detailed development notes

[My Node.js and SQLite development notes](backend-notes.md) explain the Express setup, JSON requests and responses, SQL queries, database relationships, validation, and sample data.

## Prototype data structure

A building has indoor locations on one floor. Building records include name, code, description, latitude, and longitude. Locations include a building reference, name, room number, type, description, and optional positions within the floor plan. The separate floor table and map-layer field were removed.

The supplied database was inspected read-only and contains:

| Data | Verified contents |
| --- | --- |
| Buildings | 1: Billy C. Black Building, code BCB |
| Floor model | Single floor with no selectable layers |
| Indoor locations | 0 records; schema and API routes are present |

The database contains prototype data. Geographic accuracy and real room information have not been verified.

## Implemented routes found in the source

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/` | Return a server status message |
| GET | `/api/buildings` | List buildings |
| GET | `/api/buildings/search?q=SEARCH` | Search building names or codes |
| GET | `/api/buildings/:id` | Retrieve one building |
| POST | `/api/buildings` | Add a building |
| PUT | `/api/buildings/:id` | Update a building |
| GET | `/api/buildings/:id/locations` | Retrieve locations on the building's single floor |
| POST | `/api/buildings/:id/locations` | Add a location to the building's single floor |

The source includes required-field checks for building and location writes, a missing-search-query response, and not-found responses for individual building retrieval and updates.

## Example intended user flow

1. A user searches for Billy C. Black Building in the campus map.
2. The frontend requests matching buildings.
3. The user selects the building and requests its indoor locations.

The backend provides the API structure for this flow. The supplied archive does not include a frontend or a browser-based demo, and it does not yet contain indoor-location sample records.

## Validation performed

- `node --check server.js`: passed.
- `node --check database.js`: passed.
- SQLite `PRAGMA integrity_check` on the supplied database: returned `ok`.
- Read-only queries confirmed the building data, single-floor schema, and empty locations table.

These checks validate JavaScript syntax and the supplied database, not live HTTP behavior. Dependencies have not been installed and the server/API has not been run in this workspace. No automated test suite is included.

## Remaining prototype work

- Run the server and record actual HTTP responses or screenshots as submission evidence.
- Add verified sample indoor locations if needed to demonstrate map navigation.
- Review handling of nonexistent buildings and invalid data before expanding the prototype.
- Enable and verify SQLite foreign-key enforcement; the schema declares relationships, but the source does not enable `PRAGMA foreign_keys = ON`.
- Fix two small logging typos when continuing development: `err.messasge` in `database.js`, and the single-quoted startup string that prints `${PORT}` literally in `server.js`.
- Integrate with the frontend in a later development step.

The original source has been preserved. These remaining items are recorded for continued development and have not been marked complete.
