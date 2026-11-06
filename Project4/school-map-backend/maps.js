const path = require('path');

// Keep source observations separate from positioned locations until alignment is verified.
module.exports = function registerMaps(app, db) {
    const all = (sql, params = []) => new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
    });
    const get = (sql, params) => new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
    });
    const handle = (handler) => async (req, res) => {
        try { await handler(req, res); }
        catch (err) {
            console.error('Map database error:', err.message);
            res.status(500).json({ error: 'Database error' });
        }
    };

    app.get('/api/maps', handle(async (req, res) => {
        res.json(await all(`SELECT id, building_name, level, alignment_status
            FROM maps ORDER BY id`));
    }));

    app.get('/api/maps/:mapId', handle(async (req, res) => {
        const map = await get('SELECT * FROM maps WHERE id = ?', [req.params.mapId]);
        if (!map) return res.status(404).json({ error: 'Map not found' });
        const nodes = await all(`SELECT source_node_id, source_row, name, type,
            description, hallway, distance_inches, side_indicator, verification_status
            FROM map_locations WHERE map_id = ? ORDER BY source_node_id`, [map.id]);
        const raw = await all(`SELECT source_row, cells_json FROM map_measurements
            WHERE map_id = ? ORDER BY source_row`, [map.id]);
        const pending = await all(`SELECT source_label, room_number, verification_status
            FROM map_pending_locations WHERE map_id = ? ORDER BY rowid`, [map.id]);
        const hallways = await all(`SELECT id FROM map_hallways WHERE map_id = ?
            ORDER BY id`, [map.id]);
        const destinations = await all(`SELECT id, name, room_number, type, description,
            verification_status FROM map_destinations WHERE map_id = ? ORDER BY id`, [map.id]);
        const { notes_json, image_filename, ...metadata } = map;
        res.json({ ...metadata, notes: JSON.parse(notes_json),
            map_image_url: `/api/maps/${encodeURIComponent(map.id)}/image`,
            hallways, nodes, destinations, routing_available: false, pending_right_wing: pending,
            raw_measurements: raw.map(row => ({ row: row.source_row,
                cells: JSON.parse(row.cells_json) })) });
    }));

    // Confirmed image labels are separate from unreconciled workbook observations.
    app.get('/api/maps/:mapId/locations', handle(async (req, res) => {
        const map = await get('SELECT id FROM maps WHERE id = ?', [req.params.mapId]);
        if (!map) return res.status(404).json({ error: 'Map not found' });
        const q = req.query?.q;
        if (q !== undefined && (typeof q !== 'string' || !q.trim() || q.length > 200)) {
            return res.status(400).json({ error: 'q must be a nonempty string of at most 200 characters' });
        }
        const rows = await all(`SELECT id, name, room_number, type, description,
            verification_status FROM map_destinations WHERE map_id = ?
            ORDER BY room_number IS NULL, CAST(room_number AS INTEGER), name`, [map.id]);
        const term = q?.trim().toLowerCase();
        res.json(term ? rows.filter(row => [row.name, row.room_number, row.type, row.description]
            .some(value => value?.toLowerCase().includes(term))) : rows);
    }));

    app.get('/api/maps/:mapId/locations/:locationId', handle(async (req, res) => {
        const map = await get('SELECT id FROM maps WHERE id = ?', [req.params.mapId]);
        if (!map) return res.status(404).json({ error: 'Map not found' });
        const location = await get(`SELECT id, name, room_number, type, description,
            verification_status FROM map_destinations WHERE map_id = ? AND id = ?`,
            [map.id, req.params.locationId]);
        if (!location) return res.status(404).json({ error: 'Location not found' });
        res.json(location);
    }));

    app.get('/api/maps/:mapId/image', handle(async (req, res) => {
        const map = await get('SELECT image_filename FROM maps WHERE id = ?', [req.params.mapId]);
        if (!map) return res.status(404).json({ error: 'Map not found' });
        res.sendFile(path.join(__dirname, 'data', path.basename(map.image_filename)));
    }));
};
