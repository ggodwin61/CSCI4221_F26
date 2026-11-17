// Label centers on the illustrated floor plan, measured in its native pixels.
// Rooms without a reliable location on this illustration have no marker.
export const illustratedPoints = {
  'room-133': [515, 273], 'room-135': [514, 348], 'room-139': [596, 349],
  'room-141': [672, 349], 'room-142': [577, 496], 'room-143': [790, 348],
  'room-1022': [1141, 359], 'room-1023': [1135, 452], 'room-1024': [1128, 545],
  'student-area': [1119, 645], 'room-1003': [1116, 750], 'room-1004': [1112, 830],
  'room-1005': [1110, 918], 'room-1021': [1293, 358], 'room-1020': [1278, 442],
  'room-1019': [1272, 534], 'room-1018': [1274, 617], 'room-1008': [1255, 785],
  'room-1007': [1251, 860], 'room-1006': [1255, 942], auditorium: [777, 558],
};

// The illustration merged two spaces in this row. Draw the corrected row
// and derive its marker positions from the same geometry.
export const topRow = {
  left: 476,
  top: 159,
  width: 459,
  height: 54,
  rise: 40,
  rooms: Array.from({ length: 13 }, (_, index) => 128 - index),
};

for (const [index, room] of topRow.rooms.entries()) {
  const offset = (index + 0.5) / topRow.rooms.length;
  illustratedPoints['room-' + room] = [
    topRow.left + topRow.width * offset,
    topRow.top + topRow.height / 2 + topRow.rise * offset,
  ];
}

export const additionalLabels = [133, 141, 142];
