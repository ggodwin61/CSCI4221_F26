import { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FloorPlan from './FloorPlan';
import { destinations } from '../data/bcb-level-1-destinations.json';

const light = { background: '#f4f3ed', surface: '#fffefa', text: '#132d43', muted: '#556174', line: '#e1e1d8', accent: '#07369e' };
const dark = { background: '#151c2b', surface: '#202a3d', text: '#eef2ff', muted: '#c3cce1', line: '#3b4861', accent: '#adc3ff' };
const rooms = [...destinations].sort((a, b) => (Number(a.room_number) || Infinity) - (Number(b.room_number) || Infinity));
const preferencesKey = 'campus-navigator-preferences';
const icons = { Map: '⌖', Saved: '☆', Settings: '⚙' };

function Row({ title, subtitle, onPress, colors }) {
  return <Pressable accessibilityRole="button" onPress={onPress}
    style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.line }]}>
    <View style={styles.rowText}>
      <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
      {subtitle && <Text style={{ color: colors.muted }}>{subtitle}</Text>}
    </View>
    <Text aria-hidden style={[styles.chevron, { color: colors.accent }]}>›</Text>
  </Pressable>;
}

function CampusNavigator() {
  const [tab, setTab] = useState('Map');
  const [screen, setScreen] = useState('buildings');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [preferences, setPreferences] = useState({ saved: [], darkMode: false });
  const [loaded, setLoaded] = useState(false);
  const { saved, darkMode } = preferences;
  const colors = darkMode ? dark : light;

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(preferencesKey).then(value => {
      if (!active || !value) return;
      const stored = JSON.parse(value);
      setPreferences({
        saved: Array.isArray(stored?.saved) ? stored.saved : [],
        darkMode: stored?.darkMode === true,
      });
    }).catch(() => {}).finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(preferencesKey, JSON.stringify(preferences)).catch(() => {});
  }, [loaded, preferences]);

  const backScreen = { room: 'floor', floor: 'building', building: 'buildings' }[screen];
  const canGoBack = tab === 'Map' && Boolean(backScreen);
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (tab !== 'Map') { setTab('Map'); return true; }
      if (!backScreen) return false;
      setScreen(backScreen);
      return true;
    });
    return () => sub.remove();
  }, [tab, backScreen]);

  function openRoom(room) {
    setSelected(room);
    setTab('Map');
    setScreen('room');
  }

  function toggleSaved(id) {
    setPreferences(current => ({
      ...current,
      saved: current.saved.includes(id) ? current.saved.filter(item => item !== id) : [...current.saved, id],
    }));
  }

  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const matches = rooms.filter(room => words.every(word =>
    (room.name + ' Billy C. Black Building BCB').toLowerCase().includes(word)
  ));
  const savedRooms = rooms.filter(room => saved.includes(room.id));
  const title = tab === 'Map' ? {
    buildings: 'Find a building', building: 'Billy C. Black', floor: 'Floor 1', room: selected?.name,
  }[screen] : tab;
  const settings = tab === 'Settings';

  return <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
    <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
    <View style={[styles.header, settings && styles.settingsHeader]}>
      <View style={styles.brand}>
        {canGoBack ? <Pressable accessibilityRole="button" accessibilityLabel="Go back"
          onPress={() => setScreen(backScreen)} style={styles.back}>
          <Text style={styles.backText}>‹</Text>
        </Pressable> : <Text style={[styles.asu, settings && styles.blueText]}>ASU</Text>}
        <Text style={[styles.brandTag, settings && styles.blueText]}>CAMPUS MAP</Text>
      </View>
      <Text accessibilityRole="header" style={[styles.heading, settings && styles.blueText]}>{title}</Text>
      {tab === 'Map' && screen === 'building' && <Text style={styles.headerNote}>Building code BCB · Floor 1 available</Text>}
      {tab === 'Map' && (screen === 'floor' || screen === 'buildings') && <TextInput
        accessibilityLabel="Search rooms" placeholder={screen === 'floor' ? 'Search rooms on this floor' : 'Search rooms, e.g. BCB 119'}
        placeholderTextColor={colors.muted} value={query} onChangeText={setQuery}
        autoCorrect={false} autoCapitalize="none" clearButtonMode="while-editing"
        style={[styles.search, { backgroundColor: colors.surface, color: colors.text }]} />}
    </View>

    <ScrollView key={tab + screen} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
      {!loaded ? <ActivityIndicator color={colors.accent} /> : settings ? <>
        <Text style={[styles.sectionLabel, { color: colors.muted }]}>MAP & APPEARANCE</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.line }]}>
          <Text style={[styles.rowTitle, { color: colors.text }]}>Campus</Text>
          <Text style={{ color: colors.muted }}>Albany State University</Text>
        </View>
        <Row title="App appearance" subtitle={darkMode ? 'Dark · tap for light' : 'Light · tap for dark'}
          onPress={() => setPreferences(current => ({ ...current, darkMode: !current.darkMode }))} colors={colors} />
      </> : tab === 'Saved' ? <>
        <Text style={[styles.sectionLabel, { color: colors.muted }]}>SAVED ROOMS</Text>
        {savedRooms.length ? savedRooms.map(room => <Row key={room.id} title={room.name}
          subtitle="Billy C. Black Building · Floor 1" onPress={() => openRoom(room)} colors={colors} />)
          : <Text style={{ color: colors.muted }}>Save a room to find it here.</Text>}
      </> : screen === 'buildings' && !words.length ? <>
        <Text style={[styles.sectionLabel, { color: colors.muted }]}>BUILDINGS</Text>
        <Row title="Billy C. Black Building" subtitle="BCB · Floor 1" colors={colors}
          onPress={() => setScreen('building')} />
      </> : screen === 'building' ? <>
        <Text style={[styles.sectionLabel, { color: colors.muted }]}>SELECT A FLOOR</Text>
        <Row title="Floor 1" subtitle={rooms.length + ' locations'} colors={colors}
          onPress={() => { setQuery(''); setScreen('floor'); }} />
      </> : screen === 'floor' || screen === 'buildings' ? <>
        <Text style={[styles.sectionLabel, { color: colors.muted }]}>{matches.length} LOCATIONS</Text>
        {matches.length ? matches.map(room => <Row key={room.id} title={room.name}
          onPress={() => openRoom(room)} colors={colors} />)
          : <Text style={{ color: colors.muted }}>Check the room number or building and try again.</Text>}
      </> : selected && <>
        <Pressable accessibilityRole="button" accessibilityState={{ selected: saved.includes(selected.id) }}
          onPress={() => toggleSaved(selected.id)}
          style={[styles.save, { borderColor: colors.accent, backgroundColor: colors.surface }]}>
          <Text style={[styles.rowTitle, { color: colors.accent }]}>
            {saved.includes(selected.id) ? 'Remove from saved' : 'Save room'}
          </Text>
        </Pressable>
        <FloorPlan key={selected.id} room={selected} colors={colors} />
      </>}
    </ScrollView>
    <View accessibilityRole="tablist" style={[styles.nav, { borderColor: colors.line, backgroundColor: colors.surface }]}>
      {Object.entries(icons).map(([label, icon]) => <Pressable key={label} accessibilityRole="tab"
        accessibilityState={{ selected: tab === label }} onPress={() => setTab(label)} style={styles.tab}>
        <Text aria-hidden style={[styles.icon, { color: tab === label ? colors.accent : colors.muted }]}>{icon}</Text>
        <Text style={{ color: tab === label ? colors.accent : colors.muted, fontWeight: tab === label ? '700' : '500' }}>
          {label}
        </Text>
      </Pressable>)}
    </View>
  </SafeAreaView>;
}

export default function App() {
  return <SafeAreaProvider><CampusNavigator /></SafeAreaProvider>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { backgroundColor: '#07369e', borderBottomWidth: 4, borderColor: '#f8d91d', paddingHorizontal: 20, paddingVertical: 15 },
  settingsHeader: { backgroundColor: '#f8d91d' },
  brand: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  asu: { color: '#fff', fontSize: 34, fontWeight: '800' },
  brandTag: { color: '#f8d91d', fontSize: 12, fontWeight: '700', letterSpacing: 1.2 },
  blueText: { color: '#07369e' },
  heading: { color: '#fff', fontSize: 29, fontWeight: '800', marginTop: 8 },
  headerNote: { color: '#f0f4ff', marginTop: 5 },
  back: { minWidth: 44, minHeight: 44, justifyContent: 'center' },
  backText: { color: '#fff', fontSize: 32, lineHeight: 38 },
  search: { marginTop: 12, minHeight: 46, paddingHorizontal: 12, borderRadius: 9 },
  content: { padding: 16, gap: 8 },
  sectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: 6, marginBottom: 3 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 54, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  rowText: { flex: 1, gap: 3 },
  rowTitle: { fontSize: 16, fontWeight: '700' },
  chevron: { fontSize: 23, marginLeft: 8 },
  card: { padding: 14, borderWidth: 1, borderRadius: 12, gap: 4 },
  save: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 8, padding: 11, marginBottom: 9 },
  nav: { flexDirection: 'row', borderTopWidth: 1, minHeight: 60 },
  tab: { alignItems: 'center', justifyContent: 'center', flex: 1, padding: 5 },
  icon: { fontSize: 22 },
});
