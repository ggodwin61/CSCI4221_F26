"""Run importer checks and Node route checks against an isolated SQLite database."""
from pathlib import Path
import runpy
import sqlite3
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory(prefix='campus-map-test-') as directory:
    database = Path(directory) / 'test.db'
    sys.argv = ['import-map.py', '--database', str(database)]
    runpy.run_path(str(ROOT / 'scripts/import-map.py'), run_name='__main__')
    with sqlite3.connect(database) as db:
        db.execute("UPDATE map_pending_locations SET room_number='TEST-CORRECTION', verification_status='verified' WHERE source_label='187'")
    runpy.run_path(str(ROOT / 'scripts/import-map.py'), run_name='__main__')
    with sqlite3.connect(database) as db:
        assert db.execute('SELECT count(*) FROM map_locations').fetchone()[0] == 88
        assert db.execute('SELECT count(*) FROM map_pending_locations').fetchone()[0] == 15
        assert db.execute("SELECT room_number, verification_status FROM map_pending_locations WHERE source_label='187'").fetchone() == ('TEST-CORRECTION', 'verified')
        assert db.execute('PRAGMA integrity_check').fetchone()[0] == 'ok'
        assert not db.execute('PRAGMA foreign_key_check').fetchall()
    subprocess.run(['node', str(ROOT / 'scripts/test-maps.js'), str(database)], check=True)
