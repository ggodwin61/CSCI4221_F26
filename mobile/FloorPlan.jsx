import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Rect, Text as SvgText } from 'react-native-svg';
import { additionalLabels, illustratedPoints, topRow } from '../client/map-points';

const image = require('../client/bcb-floor-1-clean.png');
const width = 1448;
const height = 1086;
const ink = '#102b54';
const roomWidth = topRow.width / topRow.rooms.length;

export default function FloorPlan({ room, colors }) {
  const [zoom, setZoom] = useState(1);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const vertical = useRef(null);
  const horizontal = useRef(null);
  const point = illustratedPoints[room.id];
  const displayWidth = viewport.width * zoom;
  const displayHeight = displayWidth * height / width;

  useEffect(() => {
    if (!point || !viewport.width) return;
    const frame = requestAnimationFrame(() => {
      horizontal.current?.scrollTo({ x: Math.max(0, point[0] / width * displayWidth - viewport.width / 2), animated: false });
      vertical.current?.scrollTo({ y: Math.max(0, point[1] / height * displayHeight - viewport.height / 2), animated: false });
    });
    return () => cancelAnimationFrame(frame);
  }, [point, viewport.width, viewport.height, displayWidth, displayHeight]);

  return <View>
    <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
      Billy C. Black Building · Floor 1
    </Text>
    <Text style={{ color: colors.muted }}>
      {point ? 'Illustrated floor plan · approximate layout' : 'Room position unavailable on this illustration'}
    </Text>
    <View style={styles.zoom}>
      <Pressable accessibilityRole="button" accessibilityLabel="Zoom out" disabled={zoom <= 1}
        onPress={() => setZoom(zoom - 0.5)} style={[styles.control, { borderColor: colors.line }]}>
        <Text style={{ color: colors.accent }}>−</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Reset zoom"
        onPress={() => setZoom(1)} style={[styles.control, { borderColor: colors.line }]}>
        <Text style={{ color: colors.accent }}>{Math.round(zoom * 100)}%</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Zoom in" disabled={zoom >= 3}
        onPress={() => setZoom(zoom + 0.5)} style={[styles.control, { borderColor: colors.line }]}>
        <Text style={{ color: colors.accent }}>+</Text>
      </Pressable>
    </View>
    <View style={[styles.viewport, { height: Math.min(420, viewport.width * height / width || 280) }]} onLayout={({ nativeEvent }) => {
      setViewport({ width: nativeEvent.layout.width, height: nativeEvent.layout.height });
    }}>
      <ScrollView ref={vertical} nestedScrollEnabled style={styles.vertical}>
        <ScrollView ref={horizontal} horizontal nestedScrollEnabled>
          {displayWidth > 0 && <View style={{ width: displayWidth, height: displayHeight }}
            accessible accessibilityRole="image" accessibilityLabel={point
              ? 'Floor plan with ' + room.name + ' highlighted' : 'Billy C. Black Building floor plan'}>
            <Image source={image} style={{ position: 'absolute', width: displayWidth, height: displayHeight }} resizeMode="stretch" />
            <Svg width={displayWidth} height={displayHeight} viewBox={`0 0 ${width} ${height}`}>
              <G transform={`translate(${topRow.left} ${topRow.top}) skewY(${Math.atan2(topRow.rise, topRow.width) * 180 / Math.PI})`}>
                {topRow.rooms.map((number, index) => <G key={number}>
                  <Rect x={index * roomWidth} width={roomWidth} height={topRow.height} fill="#d0e8f9" stroke={ink} strokeWidth={3} />
                  <SvgText x={(index + 0.5) * roomWidth} y={topRow.height / 2 + 6}
                    fill={ink} fontSize={17} fontWeight="bold" textAnchor="middle">{number}</SvgText>
                </G>)}
              </G>
              {additionalLabels.map(number => {
                const [x, y] = illustratedPoints['room-' + number];
                return <SvgText key={number} x={x} y={y + 9} fill={ink}
                  fontSize={27} fontWeight="bold" textAnchor="middle">{number}</SvgText>;
              })}
              {point && <Circle cx={point[0]} cy={point[1]} r={16 / zoom}
                fill="none" stroke="#b57300" strokeWidth={6 / zoom} />}
            </Svg>
          </View>}
        </ScrollView>
      </ScrollView>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  zoom: { flexDirection: 'row', justifyContent: 'flex-end', gap: 6, marginVertical: 8 },
  control: { minHeight: 44, minWidth: 44, paddingHorizontal: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderRadius: 8 },
  viewport: { maxHeight: 420, borderRadius: 10, overflow: 'hidden' },
  vertical: { flex: 1 },
});
