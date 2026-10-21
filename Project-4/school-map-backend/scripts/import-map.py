"""Transactionally import extracted map data. Re-import preserves pending corrections."""
import argparse
import json
from pathlib import Path
import sqlite3

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--database', type=Path, default=ROOT / 'campus.db')
args = parser.parse_args()
data = json.loads((ROOT / 'data/bcb-level-1.json').read_text())

with sqlite3.connect(args.database) as db:
    db.execute('PRAGMA foreign_keys = ON')
    # Match the existing backend schema when importing into a new database.
    db.execute('''CREATE TABLE IF NOT EXISTS buildings (
        id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, code TEXT,
        description TEXT, latitude REAL NOT NULL, longitude REAL NOT NULL)''')
    db.executescript((ROOT / 'map-schema.sql').read_text())
    with db:
        db.execute('''INSERT INTO maps
            (id, building_name, level, units, reference_entrance, coordinate_system,
             alignment_status, source_workbook, image_filename, notes_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET building_name=excluded.building_name,
            level=excluded.level, units=excluded.units,
            reference_entrance=excluded.reference_entrance,
            coordinate_system=excluded.coordinate_system,
            source_workbook=excluded.source_workbook,
            image_filename=excluded.image_filename, notes_json=excluded.notes_json''',
            (data['id'], data['building_name'], data['level'], data['units'],
             data['reference_entrance'], data['coordinate_system'],
             data['alignment_status'], data['source_workbook'], 'bcb-level-1.jpeg',
             json.dumps(data['notes'])))
        for node in data['nodes']:
            if node['hallway']:
                db.execute('INSERT OR IGNORE INTO map_hallways VALUES (?, ?)',
                           (data['id'], node['hallway']))
            db.execute('''INSERT INTO map_locations VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(map_id, source_node_id) DO UPDATE SET
                source_row=excluded.source_row, name=excluded.name,
                type=excluded.type, description=excluded.description,
                hallway=excluded.hallway, distance_inches=excluded.distance_inches,
                side_indicator=excluded.side_indicator''',
                (data['id'], node['source_node_id'], node['source_row'], node['name'],
                 node['type'], node['description'], node['hallway'],
                 node['distance_inches'], node['side_indicator'], node['verification_status']))
        for row in data['raw_measurements']:
            db.execute('''INSERT INTO map_measurements VALUES (?, ?, ?)
                ON CONFLICT(map_id, source_row) DO UPDATE SET cells_json=excluded.cells_json''',
                (data['id'], row['row'], json.dumps(row['cells'])))
        for pending in data['pending_right_wing']:
            db.execute('INSERT OR IGNORE INTO map_pending_locations VALUES (?, ?, ?, ?)',
                       (data['id'], pending['source_label'], pending['room_number'],
                        pending['verification_status']))
        errors = db.execute('PRAGMA foreign_key_check').fetchall()
        if errors:
            raise ValueError(f'Foreign key errors: {errors}')
    print(f"Imported {len(data['nodes'])} map records into {args.database}")
