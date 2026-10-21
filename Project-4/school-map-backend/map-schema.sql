CREATE TABLE IF NOT EXISTS maps (
    id TEXT PRIMARY KEY,
    building_id INTEGER REFERENCES buildings(id) ON DELETE SET NULL,
    building_name TEXT NOT NULL,
    level INTEGER NOT NULL,
    units TEXT NOT NULL CHECK (units = 'inches'),
    reference_entrance TEXT NOT NULL,
    coordinate_system TEXT NOT NULL,
    alignment_status TEXT NOT NULL,
    source_workbook TEXT NOT NULL,
    image_filename TEXT NOT NULL,
    notes_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS map_hallways (
    map_id TEXT NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
    id TEXT NOT NULL,
    PRIMARY KEY (map_id, id)
);
CREATE TABLE IF NOT EXISTS map_locations (
    map_id TEXT NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
    source_node_id INTEGER NOT NULL,
    source_row INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    hallway TEXT,
    distance_inches REAL,
    side_indicator INTEGER CHECK (side_indicator IN (-1, 0, 1)),
    verification_status TEXT NOT NULL,
    PRIMARY KEY (map_id, source_node_id),
    FOREIGN KEY (map_id, hallway) REFERENCES map_hallways(map_id, id)
);
CREATE TABLE IF NOT EXISTS map_measurements (
    map_id TEXT NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
    source_row INTEGER NOT NULL,
    cells_json TEXT NOT NULL,
    PRIMARY KEY (map_id, source_row)
);
CREATE TABLE IF NOT EXISTS map_pending_locations (
    map_id TEXT NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
    source_label TEXT NOT NULL,
    room_number TEXT,
    verification_status TEXT NOT NULL,
    PRIMARY KEY (map_id, source_label)
);
