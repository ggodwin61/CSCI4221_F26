Garret Godwin

# Project 4: Architecture — Campus Map App

**Group:** 1  
**Team:** Garret Godwin, Jada Rodgers, Amirah Muhammad  
**Product owners:** All team members  
**ScrumMaster:** Course instructor  
**Sprint:** 4 — Architecture

Backend file paths in this document are relative to [`school-map-backend/`](school-map-backend/). This document is also available in the assignment’s `Project4` folder.

**Documentation updated:** November 6, 2026.

This document describes the existing campus map backend and a proposed cloud deployment. Container deployment and the other members’ assignments require team confirmation; they are not represented as completed work.

## Section 1: Description of the container

### Architecture and selected template

Software architecture describes the major parts of an application, their responsibilities, and how they communicate. Three common templates for discussion are layered architecture, client–server architecture, and repository architecture. Confirm the instructor’s terminology against the course materials.

- **Layered:** Presentation, application logic, and data access have separate responsibilities.
- **Client–server:** A client sends requests to a server, which processes them and returns responses.
- **Repository:** Components exchange and maintain data through a central data store.

The campus map app uses a client–server design with three logical layers: a map interface, an Express API, and a SQLite database. The interface is a planned integration point; this workspace contains the backend. Users request buildings and indoor locations, and the API queries the database and returns JSON. Measured map records remain separate from positioned indoor locations until their measurements are verified.

### Cloud deployment proposal

Cloud-based software runs on remotely hosted computing resources and is accessed over a network. The proposed deployment places the backend on a cloud host with a persistent disk and HTTPS access through the hosting platform or a reverse proxy.

A Docker **image** is a packaged application filesystem and startup configuration. A **container** is a running instance of an image. The Docker **daemon** is the background service on the host that builds images and manages containers; it does not belong inside the application container.

The proposed backend image contains:

- A supported Node.js runtime and the application’s installed Express and SQLite dependencies.
- `server.js`, `database.js`, `maps.js`, `map-schema.sql`, and package manifests.
- Import scripts and a Python runtime if imports will run inside this image; otherwise imports run as a separate preparation step.
- Reference JPEG, workbook, extracted measurement JSON, and updated destination directory from `data/`.

The container runs `npm start` and listens on `PORT`, defaulting to 3000. The database must be stored on a persistent mounted directory. The implementation supports `DATABASE_PATH`; set it to `/data/campus.db` and mount persistent storage at `/data`. Without that setting the database defaults to `campus.db` beside `database.js`. Import the initial map using `python scripts/import-map.py --database /data/campus.db` before serving requests. The import command uses its own explicit database argument. A Dockerfile and deployment configuration are future implementation work, not existing files.

### Database ownership and persistence

SQLite is local to the single backend host/container deployment. It is logically shared by users through the API; clients do not open the database file directly. The database file must survive container replacement through persistent storage and backups. This proposal uses one backend instance. Multiple replicas should use a shared database service such as PostgreSQL after adapting the SQLite queries and import process; they should not share a SQLite file across hosts.

## Section 2: Components and necessary files

### Major components and sub-components

| Component | Sub-components and responsibility | Necessary files | Database usage | Proposed owner |
| --- | --- | --- | --- | --- |
| Building and indoor-location API | Request validation, building search, building creation/update, location listing/creation | `server.js`, `database.js`, `package.json`, `package-lock.json` | Reads/writes `buildings` and `locations` | Garret Godwin |
| Measured map data and import | Workbook extraction, transactional import, hallway measurements, pending room corrections | `maps.js`, `map-schema.sql`, `scripts/import-measurements.py`, `scripts/import-map.py`, source assets in `data/` | Reads/writes `maps`, `map_hallways`, `map_locations`, `map_measurements`, `map_pending_locations`, `map_destinations` | Jada Rodgers — proposed; confirm |
| Map presentation and integration | Building selection, displaying map data, API loading/error states | Client files to be identified in the combined group repository | Uses API responses; no direct database access | Amirah Muhammad — proposed; confirm |

Garret’s documented component is the building and indoor-location API. Its data-access sub-component opens SQLite, enables foreign keys, and creates the schema. Its HTTP sub-component accepts JSON, validates required fields, uses parameterized queries, and returns results or HTTP errors. Authentication and authorization are not implemented and need design before exposing write endpoints publicly.

### Existing API interface

| Method | Path | Responsibility |
| --- | --- | --- |
| GET | `/api/buildings` | List buildings |
| GET | `/api/buildings/search?q=...` | Search building names and codes |
| GET | `/api/buildings/:id` | Read one building |
| POST | `/api/buildings` | Create a building |
| PUT | `/api/buildings/:id` | Update a building |
| GET / POST | `/api/buildings/:id/locations` | List or create indoor locations |
| GET | `/api/maps` | List measured maps |
| GET | `/api/maps/:id` | Read measured map data |
| GET | `/api/maps/:id/image` | Read the updated map reference image |
| GET | `/api/maps/:id/locations?q=...` | List or search corrected room labels and areas |
| GET | `/api/maps/:id/locations/:locationId` | Read one corrected room or area |

### Sprint 4 backlog

Estimates below are planning estimates, not hours already worked. Assignments beyond Garret’s draft component need team agreement.

| PBI | Status | Sprint | Estimate | Assigned | Reviewer |
| --- | --- | --- | --- | --- | --- |
| 1. Document backend container and persistence | Draft prepared; team review pending | 4 | 3 hours | Garret Godwin | Team — confirm reviewer |
| 2. Document building/location component and `locations` table | Draft prepared; team review pending | 4 | 3 hours | Garret Godwin | Team — confirm reviewer |
| 3. Confirm measured-map component and `map_locations` table | Proposed | 4 | 3 hours | Jada Rodgers — confirm | Team — confirm reviewer |
| 4. Confirm presentation component and use of `buildings` through the API | Proposed | 4 | 3 hours | Amirah Muhammad — confirm | Team — confirm reviewer |
| 5. Hold three meetings and complete individual minutes | Two meetings held; third meeting not held | 4 | 3 meetings required | All members | All members |
| 6. Review architecture and submit personal repository link | Pending | 4 | 1 hour | Each member | Team |

Each member prepares their own component document and table structure after assignments are confirmed. Weekly Scrum meetings review backlog progress, blockers, and next steps. Sprint 4’s potentially shippable increment is the reviewed architecture submission; the assignment describes a typical sprint velocity window of 2–3 weeks and also asks for three meetings during its 10-day period. Confirm the actual dates with the instructor.

## Section 3: Structure of related tables in the database

### Selected table: `locations`

This table belongs to Garret’s proposed building and indoor-location component. It stores positioned indoor destinations on a building’s single floor. The following definition matches `database.js`:

```sql
CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    building_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    room_number TEXT,
    type TEXT NOT NULL,
    description TEXT,
    x_position REAL,
    y_position REAL,
    FOREIGN KEY (building_id)
        REFERENCES buildings(id)
        ON DELETE CASCADE
);
```

| Column | SQLite type | Constraint | Purpose |
| --- | --- | --- | --- |
| `id` | INTEGER | Primary key, autoincrement | Unique location identifier |
| `building_id` | INTEGER | Required; foreign key to `buildings.id` | Building containing the destination |
| `name` | TEXT | Required | Display name |
| `room_number` | TEXT | Nullable | Room identifier, including letters if needed |
| `type` | TEXT | Required | Destination category; the current schema has no fixed category list |
| `description` | TEXT | Nullable | Additional destination information |
| `x_position` | REAL | Nullable | Horizontal map position after verification |
| `y_position` | REAL | Nullable | Vertical map position after verification |

One building has many locations. Deleting a building cascades to its locations when foreign-key enforcement is enabled, as it is in `database.js`. The existing schema does not define coordinate units or bounds for `x_position` and `y_position`; the team must settle that convention before populating them. Raw hallway distances in inches and spreadsheet side indicators must not be treated as verified map coordinates.

The component lists locations by `building_id`, ordered by room number and name. Creating a location requires a name and type in the API, and a valid building relationship in SQLite. No authentication or user ownership columns currently exist.

### Updated room directory: `map_destinations`

The corrected image labels are stored separately from raw workbook observations.
This is the table used by the current room search endpoints. It includes rooms
1003, 1004, 1005, 1006, 1007, 1008, 1021, and 1024. Corrections at 1021 and 1024
change numbers only, not room layout. The student area is below 1024.

```sql
CREATE TABLE IF NOT EXISTS map_destinations (
    map_id TEXT NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
    id TEXT NOT NULL,
    name TEXT NOT NULL,
    room_number TEXT,
    type TEXT NOT NULL,
    description TEXT,
    verification_status TEXT NOT NULL,
    PRIMARY KEY (map_id, id)
);
CREATE INDEX IF NOT EXISTS map_destinations_room
    ON map_destinations(map_id, room_number);
```

| Column | Type | Constraint | Purpose |
| --- | --- | --- | --- |
| `map_id` | TEXT | Required; foreign key to `maps.id`; part of primary key | Parent map |
| `id` | TEXT | Required; part of primary key | Stable destination key, such as `room-1003` |
| `name` | TEXT | Required | Display name |
| `room_number` | TEXT | Nullable | Corrected room label; null for unnumbered areas |
| `type` | TEXT | Required | Room, student area, or auditorium |
| `description` | TEXT | Nullable | Destination context |
| `verification_status` | TEXT | Required | Basis of label confirmation |

One map has many destinations; deleting the map cascades to its destinations.
The composite key makes imports repeatable without duplicate records. Rooms are
identified as text so future letter suffixes remain supported. This table has no
route coordinates and no foreign key to unverified workbook room observations.

### Supporting tables

| Table | Key and relationship | Responsibility |
| --- | --- | --- |
| `buildings` | Integer primary key `id` | Building name, code, description, latitude, longitude |
| `maps` | Text primary key `id`; optional `building_id` foreign key | Map metadata, image filename, units, reference entrance, alignment status |
| `map_hallways` | Composite primary key `(map_id, id)` | Hallway identities belonging to a map |
| `map_locations` | Composite primary key `(map_id, source_node_id)`; hallway foreign key | Unreconciled source observations and local measurements |
| `map_measurements` | Composite primary key `(map_id, source_row)` | Raw workbook cells preserved as JSON |
| `map_pending_locations` | Composite primary key `(map_id, source_label)` | Historical labels and manually preserved correction status |

Full definitions are in `database.js` and `map-schema.sql`.

### Current verification and limits

`npm test` passes isolated import, repeat-import, database integrity, corrected
room lookup, search validation, missing-record responses, and image-file checks.
A live HTTP check confirmed room 1024 and the updated JPEG. These checks do not
establish a deployed cloud service. The root URL is a server status message;
room endpoints return JSON and the map image endpoint returns JPEG. A visual
search page and turn-by-turn routing are future integration work. No Dockerfile
or deployed container is currently supplied.
