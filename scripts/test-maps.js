const assert = require('node:assert/strict');
const fs = require('node:fs');
const sqlite3 = require('sqlite3');
const registerMaps = require('../maps');

(async () => {
    const filename = process.argv[2];
    assert(filename, 'Supply an isolated test database');
    let db;
    try {
        db = new sqlite3.Database(filename);
        const run = (sql) => new Promise((resolve, reject) => db.run(sql,
            err => err ? reject(err) : resolve()));
        const routes = {};
        registerMaps({ get(route, handler) { routes[route] = handler; } }, db);
        async function request(route, mapId = 'bcb-level-1') {
            const response = { statusCode: 200,
                status(code) { this.statusCode = code; return this; },
                json(body) { this.body = body; }, sendFile(file) { this.file = file; } };
            await routes[route]({ params: { mapId } }, response);
            return response;
        }
        let response = await request('/api/maps/:mapId');
        assert.equal(response.statusCode, 200);
        const source = require('../data/bcb-level-1.json');
        assert.deepEqual(response.body.nodes, source.nodes);
        assert.deepEqual(response.body.raw_measurements, source.raw_measurements);
        assert.equal(response.body.pending_right_wing.length, source.pending_right_wing.length);
        assert.equal(response.body.hallways.length, 6);
        assert.equal(response.body.units, 'inches');
        assert.equal(response.body.reference_entrance, 'Entrance beside room 116');
        assert.equal((await request('/api/maps')).body.length, 1);
        assert(fs.existsSync((await request('/api/maps/:mapId/image')).file));
        assert.equal((await request('/api/maps/:mapId', 'missing')).statusCode, 404);
        assert.equal((await request('/api/maps/:mapId/image', "' OR 1=1 --")).statusCode, 404);
        response = await request('/api/maps/:mapId');
        assert.equal(response.body.nodes.length, 88);
        assert.equal(response.body.pending_right_wing.length, 15);
        assert.equal(response.body.pending_right_wing.find(x => x.source_label === '187').room_number,
            'TEST-CORRECTION');
        // Prove the endpoint reads current DB values, independently of the JSON source.
        await run("UPDATE maps SET reference_entrance='DB test entrance'");
        assert.equal((await request('/api/maps/:mapId')).body.reference_entrance, 'DB test entrance');
        const problems = await new Promise((resolve, reject) => db.all('PRAGMA foreign_key_check',
            (err, rows) => err ? reject(err) : resolve(rows)));
        assert.deepEqual(problems, []);
        console.log('PASS: database-backed endpoints, exact source round-trip, re-import, correction preservation, images, 404, foreign keys');
    } finally {
        if (db) await new Promise((resolve, reject) => db.close(err => err ? reject(err) : resolve()));
    }
})().catch(err => { console.error(err); process.exitCode = 1; });
