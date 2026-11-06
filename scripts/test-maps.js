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
        async function request(route, mapId = 'bcb-level-1', query = {}, locationId = '') {
            const response = { statusCode: 200,
                status(code) { this.statusCode = code; return this; },
                json(body) { this.body = body; }, sendFile(file) { this.file = file; } };
            await routes[route]({ params: { mapId, locationId }, query }, response);
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
        const directory = require('../data/bcb-level-1-destinations.json');
        assert.equal(response.body.destinations.length, directory.destinations.length);
        assert.equal(response.body.routing_available, false);
        const listing = '/api/maps/:mapId/locations';
        const detail = '/api/maps/:mapId/locations/:locationId';
        assert.equal((await request(listing)).body.length, directory.destinations.length);
        for (const number of ['1021', '1024']) {
            const results = (await request(listing, 'bcb-level-1', { q: number })).body;
            assert(results.some(result => result.room_number === number));
            assert.equal((await request(detail, 'bcb-level-1', {}, 'room-' + number)).body.room_number, number);
        }
        assert.equal((await request(listing, 'bcb-level-1', { q: 'STUDENT AREA' })).body[0].id, 'student-area');
        assert.equal((await request(listing, 'bcb-level-1', { q: "' OR 1=1 --" })).body.length, 0);
        assert.equal((await request(listing, 'missing')).statusCode, 404);
        assert.equal((await request(detail, 'missing', {}, 'room-1021')).statusCode, 404);
        assert.equal((await request(detail, 'bcb-level-1', {}, 'missing')).statusCode, 404);
        for (const q of ['', ['1021'], 'x'.repeat(201)]) {
            assert.equal((await request(listing, 'bcb-level-1', { q })).statusCode, 400);
        }
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
