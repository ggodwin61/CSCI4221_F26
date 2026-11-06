const express = require('express');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
	res.send('School Map Backend is running!');
});

app.get('/api/buildings', (req, res) => {
	db.all('SELECT * FROM buildings', [], (err, rows) => {
		if (err) {
			console.error(err.message);
			return res.status(500).json({ error: 'Database error' });
		}
		
		res.json(rows);
	});
});

// Search buildings by name or code
app.get('/api/buildings/search', (req, res) => {
    const query = req.query.q;

    if (!query) {
        return res.status(400).json({
            error: 'Search query is required'
        });
    }

    const sql = `
        SELECT * FROM buildings
        WHERE name LIKE ? OR code LIKE ?
        ORDER BY name
    `;

    const searchTerm = `%${query}%`;

    db.all(sql, [searchTerm, searchTerm], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({
                error: 'Database error'
            });
        }

        res.json(rows);
    });
});

// Get one building by ID
app.get('/api/buildings/:id', (req, res) => {
    const id = req.params.id;

    db.get(
        'SELECT * FROM buildings WHERE id = ?',
        [id],
        (err, row) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: 'Database error' });
            }

            if (!row) {
                return res.status(404).json({ error: 'Building not found' });
            }

            res.json(row);
        }
    );
});

app.post('/api/buildings', (req,res) => {
	const { name, code, description, latitude, longitude } = req.body;

	if (!name || latitude == null || longitude == null) {
		return res.status(400).json({
			error: 'Name, latitude, and longitude are required'
		});
	}
	
	const sql = `
		INSERT INTO buildings
		(name, code, description, latitude, longitude)
		VALUES (?, ?, ?, ?, ?)
	`;

	db.run(
		sql,
		[name, code, description, latitude, longitude],
		function (err) {
			if (err) {
				console.error(err.message);
				return res.status(500).json({ error: 'Database error'});
			}
	
			res.status(201).json({
				id: this.lastID,
				name,
				code,
				description,
				latitude,
				longitude
			});
		}
	);
});

// Update a building
app.put('/api/buildings/:id', (req, res) => {
    const id = req.params.id;
    const { name, code, description, latitude, longitude } = req.body;

    if (!name || latitude == null || longitude == null) {
        return res.status(400).json({
            error: 'Name, latitude, and longitude are required'
        });
    }

    const sql = `
        UPDATE buildings
        SET name = ?, code = ?, description = ?, latitude = ?, longitude = ?
        WHERE id = ?
    `;

    db.run(
        sql,
        [name, code, description, latitude, longitude, id],
        function (err) {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: 'Database error' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Building not found' });
            }

            res.json({
                id: Number(id),
                name,
                code,
                description,
                latitude,
                longitude
            });
        }
    );
});

// Get all indoor locations for a building's single floor
app.get('/api/buildings/:id/locations', (req, res) => {
    const buildingId = req.params.id;

    const sql = `
        SELECT id, building_id, name, room_number, type,
               description, x_position, y_position
        FROM locations
        WHERE building_id = ?
        ORDER BY room_number, name
    `;

    db.all(sql, [buildingId], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({
                error: 'Database error'
            });
        }

        res.json(rows);
    });
});

// Add an indoor location to a building's single floor
app.post('/api/buildings/:id/locations', (req, res) => {
    const buildingId = req.params.id;

    const {
        name,
        room_number,
        type,
        description,
        x_position,
        y_position
    } = req.body;

    if (!name || !type) {
        return res.status(400).json({
            error: 'Name and type are required'
        });
    }

    const sql = `
        INSERT INTO locations
        (building_id, name, room_number, type, description, x_position, y_position)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
        sql,
        [
            buildingId,
            name,
            room_number,
            type,
            description,
            x_position,
            y_position
        ],
        function (err) {
            if (err) {
                console.error(err.message);
                return res.status(500).json({
                    error: 'Database error'
                });
            }

            res.status(201).json({
                id: this.lastID,
                building_id: Number(buildingId),
                name,
                room_number,
                type,
                description,
                x_position,
                y_position
            });
        }
    );
});

app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
});
