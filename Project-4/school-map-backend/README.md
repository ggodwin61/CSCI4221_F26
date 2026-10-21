# Project 4 — Campus Map Backend

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

Run from this directory because `database.js` opens `./campus.db` relative to the current working directory. The repository database contains prototype data and should be copied before trying write requests if you want to preserve the supplied sample.

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

Dependency installation was blocked by DNS access to registry.npmjs.org. Run `npm ci` with internet access, then `npm start`.
