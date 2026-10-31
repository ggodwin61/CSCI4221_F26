# Campus Map Backend Prototype

**Developer:** Garret Godwin  
**Group:** 1  
**Sprint:** 2 — Project 2

This is the Node.js/Express and SQLite backend developed on DragonOS and simplified to use one floor without selectable map layers.

## Run the prototype

From this directory, with Node.js and npm installed:

```bash
npm ci
node server.js
```

Open `http://localhost:3000/` to see the server status message. The package does not currently define an `npm start` script; use `node server.js`.

Run from this directory because `database.js` opens `./campus.db` relative to the current working directory. The database contains prototype data and should be copied before trying write requests if you want to preserve the supplied sample.

Dependencies are installed for the current machine rather than copied from DragonOS. `node_modules` is excluded from Git. The project's existing `npm test` script is a placeholder and exits with an error; there is no automated test suite in the supplied archive.

## Try read requests

```bash
curl http://localhost:3000/api/buildings
curl 'http://localhost:3000/api/buildings/search?q=Billy'
curl http://localhost:3000/api/buildings/1
curl http://localhost:3000/api/buildings/1/locations
```

The prototype uses a single floor, so indoor locations are requested directly from the selected building. The supplied database has no location records yet, so an empty array is expected for an existing building.

See [backend_prototype.md](../backend_prototype.md) for the API inventory, verified sample data, and validation limits.
