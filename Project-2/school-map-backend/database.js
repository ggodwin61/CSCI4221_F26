const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./campus.db', (err) => {
	if (err) {
		console.error('Database connection error:', err.messasge);
	} else {
		console.log('Connected to the campus database.');
	}
});

db.run(`
	CREATE TABLE IF NOT EXISTS buildings (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		code TEXT,
		description TEXT,
		latitude REAL NOT NULL,
		longitude REAL NOT NULL
	)
`);

db.run(`
    CREATE TABLE IF NOT EXISTS floors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        building_id INTEGER NOT NULL,
        floor_number INTEGER NOT NULL,
        name TEXT NOT NULL,
        map_layer TEXT,
        FOREIGN KEY (building_id)
            REFERENCES buildings(id)
            ON DELETE CASCADE,
        UNIQUE(building_id, floor_number)
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        floor_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        room_number TEXT,
        type TEXT NOT NULL,
        description TEXT,
        x_position REAL,
        y_position REAL,
        FOREIGN KEY (floor_id)
            REFERENCES floors(id)
            ON DELETE CASCADE
    )
`);

module.exports = db;

