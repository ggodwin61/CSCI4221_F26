# CSCI4221_F26
Software Engineering Fall 2026

We will use vibe coding to design and build software.

Product Vision Statement

FOR students, faculty, staff, and visitors
WHO need an easier way to locate classrooms and offices on campus,
THE Campus Navigator is a campus navigation application
THAT allows users to search for classrooms, offices, and other campus locations and receive information to help them find their destination.
UNLIKE relying on campus signs, printed maps, or asking others for directions,
OUR PRODUCT will provide a simple and convenient way to search for specific campus locations.

Garret Godwin — Back-End Developer

I will serve as the Back-End Developer. My responsibilities will include developing the application's underlying logic, organizing and managing application data, and developing the functionality needed to connect the application's data with the front end.

Meeting Minutes

Date: September 8, 2026
Time: 11:00 AM – 12:00 PM
Attendees: Jada Rogers, Garret Godwin, and Amirah Muhammad

During our meeting, we discussed what information the Campus Navigator would need in order to help users find classrooms and offices. We talked about the need to store information about campus buildings, room numbers, offices, and other locations so that the application can retrieve the correct information when a user performs a search.

We also discussed how the back end will need to provide the information that is displayed by the front end. This will require us to determine how the campus location data will be organized as we begin developing the application.

As the Back-End Developer, I will focus on the application logic and the organization and management of the data needed by the Campus Navigator. I will also work with the front-end developer to make sure the correct information can be retrieved and displayed to the user.

## Course projects

- [Project 2](Project-2/README.md)
- [Project 3](Project-3/)
- [Project 4 — Architecture and meeting records](Project4/README.md)

## Local backend workspace

The backend can also be run from the repository root. Its setup and API notes follow.

# Project 4: Architecture — Campus Map App

**Garret Godwin · Group 1**

The architecture assignment, meeting records, and backend repository copy are consolidated in [Project-4](CSCI4221_F26/Project4/README.md). See the [architecture document](CSCI4221_F26/Project4/architecture.md) for the three required sections.

# Campus Map Backend

## Measured floor map

`GET /api/maps` lists available maps. `GET /api/maps/bcb-level-1` returns
the imported workbook records, raw Sheet1 measurements, and verification status.
`GET /api/maps/bcb-level-1/image` serves the annotated reference photo.

The supplied photo and workbook are preserved in `data/`. Run `npm run import:map`
to extract the workbook and import it into `campus.db`. Both import steps use
Python's standard library. The API reads SQLite on each request; JSON is an
intermediate import artifact, not the API's data source.

The schema in `map-schema.sql` contains `maps`, `map_hallways`, `map_locations`,
`map_measurements`, and `map_pending_locations`. The import uses a transaction
and stable source keys so re-running it does not create duplicates. It preserves
pending room-number corrections and verification statuses. Re-importing refreshes
source measurements and names, so make measurement corrections in the workbook.
Source rows absent from a later workbook are retained for manual reconciliation.

Measurements are in inches. The reference entrance is beside room 116.
Distances are local to individual hallways; the spreadsheet's side indicators
are not physical Y coordinates. Conflicting distances, repeated names, and
hallway origins still need reconciliation before creating positioned locations
or routing paths. Source observations live in SQLite `map_locations`, separately
from positioned `locations` used by the existing building API.

The 15 right-wing labels supplied by the user are recorded under
`pending_right_wing` with null room numbers and `awaiting_room_numbers` status.
These labels are reference text from the incorrect map, not confirmed room names.
When corrections arrive, update `room_number` and `verification_status` in
`map_pending_locations`, keeping `source_label` as the original map label.
The map can be read without a building record; no geographic coordinates have
been assumed for the empty buildings table.

**Developer:** Garret Godwin  
**Group:** 1  
**Project:** 4 — Measured map database integration

This is the Node.js/Express and SQLite backend developed on DragonOS and simplified to use one floor without selectable map layers.

## Run the prototype

From this directory, with Node.js and npm installed:

```bash
npm ci
npm start
```

Open `http://localhost:3000/` to see the server status message. The local package defines `npm start` to run `server.js`.

The database defaults to `campus.db` beside `database.js`; set `DATABASE_PATH` to use another database. The repository database contains prototype data and should be copied before trying write requests if you want to preserve the supplied sample.

Dependencies are installed for the current machine rather than copied from DragonOS.
`node_modules` is excluded from Git. Run `npm test` for isolated database import
and API handler checks, including re-import and correction preservation. These
checks invoke handlers directly and do not require opening an HTTP port.

## Try read requests

```bash
curl http://localhost:3000/api/buildings
curl 'http://localhost:3000/api/buildings/search?q=Billy'
curl http://localhost:3000/api/buildings/1
curl http://localhost:3000/api/buildings/1/locations
```

The prototype uses a single floor, so indoor locations are requested directly from the selected building. The supplied database has no location records yet, so an empty array is expected for an existing building.

Map records are available at `/api/maps/bcb-level-1`; the annotated image is
available at `/api/maps/bcb-level-1/image`.


## Local restoration status

The JavaScript files and package manifests were restored from `ggodwin61/CSCI4221_F26`, `Project-2/school-map-backend`. A start script was added. The original binary `campus.db` could not be downloaded through the available connector. The local database now contains the measured floor map; original sample building records have not been restored. Starting the server creates the schema; run `npm run import:map` to populate map data in a new database.

Install dependencies with `npm ci`, then run `npm start`.

## Updated map directory

The updated `school.jpeg` is served as `data/bcb-level-1.jpeg`.
`data/bcb-level-1-destinations.json` records visible room labels and the student
area. Rooms 1021 and 1024 correct numbers only; the layout is unchanged. The red
shaded area below 1024 is the student area. This directory is separate from the
old workbook observations and historical pending labels, which remain available
for reconciliation. It is a directory of visible labels, not a complete inventory.

- `GET /api/maps/bcb-level-1/locations` lists the updated directory.
- `GET /api/maps/bcb-level-1/locations?q=1021` searches names, numbers, types, and descriptions.
- `GET /api/maps/bcb-level-1/locations/room-1024` returns a room.
- `GET /api/maps/bcb-level-1/locations/student-area` returns the student area.

Map details include `destinations` and `routing_available: false`. Confirmed
hallway connections and reconciled measurements are still required for routing.
Run `npm run import:map` after editing the source files; imports update directory
records by stable ID without creating duplicates. Records omitted from later
imports are retained for manual reconciliation.
