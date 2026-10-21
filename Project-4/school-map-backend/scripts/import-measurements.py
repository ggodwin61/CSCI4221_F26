"""Extract the supplied workbook without interpreting local distances as map coordinates."""
import json
from pathlib import Path
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
NS = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}


def read_rows(archive, sheet, strings):
    rows = []
    for row in ET.fromstring(archive.read(sheet)).findall('.//s:sheetData/s:row', NS):
        cells = {}
        for cell in row:
            value = cell.find('s:v', NS)
            inline = cell.find('s:is', NS)
            value = value.text if value is not None else ''.join(inline.itertext()) if inline is not None else None
            if cell.get('t') == 's':
                value = strings[int(value)]
            if value is not None:
                cells[''.join(filter(str.isalpha, cell.get('r')))] = value
        rows.append({'row': int(row.get('r')), 'cells': cells})
    return rows


with zipfile.ZipFile(ROOT / 'data/UGR-Measurements.xlsx') as archive:
    strings = [''.join(item.itertext()) for item in ET.fromstring(archive.read('xl/sharedStrings.xml')).findall('s:si', NS)]
    raw = read_rows(archive, 'xl/worksheets/sheet1.xml', strings)
    records = read_rows(archive, 'xl/worksheets/sheet2.xml', strings)

nodes = []
hallway = None
for record in records[1:]:
    cells = record['cells']
    if not cells.get('B'):
        continue
    if cells.get('C') == 'HALLWAY':
        hallway = cells['B']
    elif cells.get('C') == 'LOBBY':
        hallway = None
    nodes.append({
        'source_node_id': int(cells['A']), 'source_row': record['row'],
        'name': cells['B'], 'type': cells.get('C', '').strip(),
        'description': cells.get('F'), 'hallway': hallway,
        'distance_inches': float(cells['D']) if cells.get('D') else None,
        'side_indicator': int(cells['E']) if cells.get('E') else None,
        'verification_status': 'needs_reconciliation',
    })

pending = ['187', '189', '185', 'Distance Learning Laboratory', '191', '193',
           'Testing Center', 'Office 195', 'Office', 'The Graduate School',
           '190', 'Student Lounge', '184', 'Computer Laboratory', 'State Auditors']
dataset = {
    'id': 'bcb-level-1', 'building_name': 'Billy C. Black Building', 'level': 1,
    'units': 'inches', 'reference_entrance': 'Entrance beside room 116',
    'coordinate_system': 'Hallway-local distances; side indicators are not physical Y coordinates.',
    'alignment_status': 'pending_reconciliation',
    'source_workbook': 'UGR-Measurements.xlsx', 'map_image_url': '/api/maps/bcb-level-1/image',
    'notes': [
        'The entrance beside 116 is the user-confirmed reference; offsets from that entrance have not been reconciled.',
        'Sheet1 and Sheet2 contain differing distances and labels; neither is treated as authoritative.',
        'Hallway header distances represent lengths, not destination positions.',
        'Lobby records have no confirmed shared origin or hallway assignment.',
        'Repeated names and IDs are retained as source records, not deduplicated destinations.',
        'Routing and building-wide map coordinates are not established.',
    ],
    'pending_right_wing': [{'source_label': label, 'room_number': None,
                            'verification_status': 'awaiting_room_numbers'} for label in pending],
    'nodes': nodes, 'raw_measurements': raw,
}
(ROOT / 'data/bcb-level-1.json').write_text(json.dumps(dataset, indent=2) + '\n')
print(f'Imported {len(nodes)} source nodes; {len(pending)} right-wing labels pending.')
