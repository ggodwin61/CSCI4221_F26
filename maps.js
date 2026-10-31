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
        const { notes_json, image_filename, ...metadata } = map;
        res.json({ ...metadata, notes: JSON.parse(notes_json),
            map_image_url: `/api/maps/${encodeURIComponent(map.id)}/image`,
            hallways, nodes, pending_right_wing: pending,
            raw_measurements: raw.map(row => ({ row: row.source_row,
                cells: JSON.parse(row.cells_json) })) });
    }));

    app.get('/api/maps/:mapId/image', handle(async (req, res) => {
        const map = await get('SELECT image_filename FROM maps WHERE id = ?', [req.params.mapId]);
        if (!map) return res.status(404).json({ error: 'Map not found' });
        res.sendFile(path.join(__dirname, 'data', path.basename(map.image_filename)));
    }));
};
