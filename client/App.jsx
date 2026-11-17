import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { additionalLabels, illustratedPoints, topRow } from './map-points';
import cleanFloorPlan from './bcb-floor-1-clean.png';
import './styles.css';

async function readJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error('Could not load the campus directory.');
  return response.json();
}

function normalized(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

async function loadDirectory(signal) {
  const [maps, buildings] = await Promise.all([
    readJson('/api/maps', signal),
    readJson('/api/buildings', signal),
  ]);
  const directory = await Promise.all(maps.map(async map => {
    const url = '/api/maps/' + encodeURIComponent(map.id);
    const building = buildings.find(item => normalized(item.name) === normalized(map.building_name));
    return {
      ...map,
      code: building?.code || (map.id === 'bcb-level-1' ? 'BCB' : ''),
      image: url + '/image',
      rooms: await readJson(url + '/locations', signal),
    };
  }));
  const additional = await Promise.all(buildings.map(async building => {
    const rooms = await readJson('/api/buildings/' + building.id + '/locations', signal);
    const recorded = directory.filter(map => normalized(map.building_name) === normalized(building.name));
    const extra = rooms.filter(room => !recorded.some(map => map.rooms.some(entry =>
      room.room_number ? entry.room_number === room.room_number : normalized(entry.name) === normalized(room.name)
    )));
    return {
      id: 'building-' + building.id,
      building_name: building.name,
      code: building.code,
      level: 1,
      rooms: extra,
    };
  }));
  return directory.concat(additional.filter(building => building.rooms.length));
}

function FloorPlan({ floor, room }) {
  const illustrated = floor.id === 'bcb-level-1';
  const [zoom, setZoom] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const viewport = useRef(null);
  const marker = useRef(null);
  const point = illustrated ? illustratedPoints[room?.id] : undefined;
  const imageWidth = illustrated ? 1448 : 2732;
  const imageHeight = illustrated ? 1086 : 2048;
  const image = illustrated ? cleanFloorPlan : floor.image;

  useLayoutEffect(() => {
    if (!loaded || !point || !marker.current) return;
    const view = viewport.current;
    const bounds = view.getBoundingClientRect();
    const position = marker.current.getBoundingClientRect();
    view.scrollLeft += position.left + position.width / 2 - bounds.left - view.clientWidth / 2;
    view.scrollTop += position.top + position.height / 2 - bounds.top - view.clientHeight / 2;
  }, [loaded, point, zoom]);

  if (!image || failed) {
    return <p className="map-empty" role="status">Floor map unavailable.</p>;
  }

  return <>
    {illustrated && <p className="map-source">Illustrated floor plan · approximate layout</p>}
    <div className="map-tools">
      <span>{room ? (point ? room.name + ' highlighted' : 'Marker unavailable for ' + room.name) : 'Floor overview'}</span>
      <div className="zoom">
        <button aria-label="Zoom out" onClick={() => setZoom(zoom - 0.5)} disabled={zoom === 1}>−</button>
        <button aria-label="Reset zoom" onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</button>
        <button aria-label="Zoom in" onClick={() => setZoom(zoom + 0.5)} disabled={zoom === 3}>+</button>
      </div>
    </div>
    <div className="map-viewport" ref={viewport} tabIndex={0} aria-label="Scrollable floor map">
      <div className="map-image" style={{ width: zoom * 100 + '%' }}>
        <img src={image} alt={floor.building_name + ', level ' + floor.level + ' floor plan'}
          width={imageWidth} height={imageHeight} onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />
        {loaded && illustrated && <>
          <div className="illustrated-top-row" style={{
            left: topRow.left / imageWidth * 100 + '%',
            top: topRow.top / imageHeight * 100 + '%',
            width: topRow.width / imageWidth * 100 + '%',
            height: topRow.height / imageHeight * 100 + '%',
            transform: 'skewY(' + Math.atan2(topRow.rise, topRow.width) + 'rad)',
          }}>{topRow.rooms.map(number => <span key={number}>{number}</span>)}</div>
          {additionalLabels.map(number => {
            const [x, y] = illustratedPoints['room-' + number];
            return <span key={number} className="illustrated-label" style={{
              left: x / imageWidth * 100 + '%',
              top: y / imageHeight * 100 + '%',
            }}>{number}</span>;
          })}
        </>}
        {loaded && point && <span className="marker" ref={marker} aria-hidden="true" style={{
          left: point[0] / imageWidth * 100 + '%',
          top: point[1] / imageHeight * 100 + '%',
        }} />}
      </div>
    </div>
  </>;
}

const roomTypes = {
  ROOM: 'Room', STUDENT_AREA: 'Student area', AUDITORIUM: 'Auditorium',
};

function usePreference(key, initial) {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? initial; }
    catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { /* Preferences still work for the current session. */ }
  }, [key, value]);
  return [value, setValue];
}

function App() {
  const [directory, setDirectory] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState('');
  const [building, setBuilding] = useState('');
  const [level, setLevel] = useState(null);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('Map');
  const [overview, setOverview] = useState(false);
  const [saved, setSaved] = usePreference('campus-saved-rooms', []);
  const [appearance, setAppearance] = usePreference('campus-appearance', 'Light');
  const mapPanel = useRef(null);

  function chooseRoom(key) {
    setSelected(key);
    requestAnimationFrame(() => {
      if (window.matchMedia('(max-width: 680px)').matches) mapPanel.current?.scrollIntoView({ block: 'start' });
    });
  }

  function toggleSaved(key) {
    setSaved(current => current.includes(key) ? current.filter(item => item !== key) : [...current, key]);
  }

  useEffect(() => {
    const controller = new AbortController();
    loadDirectory(controller.signal).then(data => {
      if (!controller.signal.aborted) setDirectory(data);
    }).catch(error => {
      if (!controller.signal.aborted) setError(error.message);
    });
    return () => controller.abort();
  }, [attempt]);

  const words = normalized(query).split(' ').filter(Boolean);
  const floors = directory?.filter(floor => !building || (floor.building_name === building && (level === null || floor.level === level))) ?? [];
  const results = floors.flatMap(floor => floor.rooms
    .filter(room => {
      const searchable = normalized([room.name, room.room_number, floor.building_name, floor.code].join(' '));
      return words.every(word => searchable.includes(word));
    })
    .map(room => ({ floor, room, key: floor.id + '/' + room.id })));
  const active = results.find(result => result.key === selected);
  const floor = active?.floor ?? floors.find(floor => floor.image) ?? floors[0];
  const room = active?.room;
  const buildingNames = [...new Set(directory?.map(floor => floor.building_name))];

  const buildingFloors = directory?.filter(item => item.building_name === building) ?? [];
  const overviewFloors = [...new Set(buildingFloors.map(item => item.level))].sort((a, b) => a - b);
  const savedRooms = directory?.flatMap(item => item.rooms
    .map(entry => ({ floor: item, room: entry, key: item.id + '/' + entry.id }))
    .filter(item => saved.includes(item.key))) ?? [];
  const title = tab !== 'Map' ? tab : overview ? building : 'Find a classroom';

  return <div className="app-shell" data-appearance={appearance.toLowerCase()}>
    <header className={'site-header' + (tab === 'Settings' ? ' settings-header' : '')}>
      <div className="header-inner">
        <div className="brand-row"><strong>ASU</strong><span>Campus Map</span></div>
        <h1>{title}</h1>
        {tab === 'Settings' && <p>Choose how the campus app looks.</p>}
        {tab === 'Map' && overview && <p>{[buildingFloors.find(item => item.code)?.code, overviewFloors.length === 1 ? '1 floor available' : overviewFloors.length + ' floors available'].filter(Boolean).join(' · ')}</p>}
      </div>
    </header>
    <main>
      {tab === 'Settings' ? <section className="settings" aria-label="Settings">
        <h2 className="section-label">Map &amp; appearance</h2>
        <div className="panel settings-card">
          <div className="setting-row"><strong>Campus</strong><span>Albany State University</span></div>
          <div className="setting-row">
            <label htmlFor="appearance">App appearance</label>
            <select id="appearance" value={appearance} onChange={event => setAppearance(event.target.value)}>
              <option>Light</option><option>Dark</option>
            </select>
          </div>
        </div>
        <h2 className="section-label">Help</h2>
        <details className="panel settings-card">
          <summary>Search and map help</summary>
          <p>Search for a room number or building, then select a result to view it on the floor plan. Use + and − to zoom.</p>
        </details>
      </section> : tab === 'Saved' ? <section className="settings" aria-label="Saved rooms">
        <h2 className="section-label">Saved rooms</h2>
        {!directory ? <p role="status">{error || 'Loading saved rooms…'}</p> : !savedRooms.length
          ? <div className="panel settings-card">Save a room from the map to find it here.</div>
          : <ul className="results saved-results">{savedRooms.map(({ floor, room, key }) => <li key={key}>
            <button onClick={() => {
              setTab('Map'); setBuilding(floor.building_name); setLevel(floor.level); setQuery(''); setOverview(false); chooseRoom(key);
            }}><span className="result-name">{room.name}</span>
              <span className="result-meta">{floor.building_name} · Floor {floor.level}</span>
            </button>
          </li>)}</ul>}
      </section> : overview ? <section className="settings" aria-label="Building overview">
        <button className="text-button" onClick={() => { setBuilding(''); setLevel(null); setOverview(false); }}>‹ All buildings</button>
        <h2 className="section-label">Select a floor</h2>
        <ul className="results saved-results">{overviewFloors.map(floorLevel => <li key={floorLevel}>
          <button onClick={() => { setLevel(floorLevel); setOverview(false); }}>
            <span className="result-name">Floor {floorLevel}</span>
            <span className="result-meta">{buildingFloors.filter(entry => entry.level === floorLevel).reduce((count, entry) => count + entry.rooms.length, 0)} locations</span>
          </button>
        </li>)}</ul>
      </section> : <div className="layout">
        <section className="directory panel" aria-labelledby="directory-title">
          {building && <button className="text-button" onClick={() => { setQuery(''); setSelected(null); setOverview(true); }}>‹ {building}</button>}
          <h2 id="directory-title">{building && floor ? 'Floor ' + floor.level : 'Room directory'}</h2>
          <label htmlFor="search">Search rooms</label>
          <input id="search" type="search" placeholder="e.g. BCB 1024" value={query}
            onChange={event => { setQuery(event.target.value); setSelected(null); }} />
          <label htmlFor="building">Building</label>
          <select id="building" value={building} onChange={event => {
            setBuilding(event.target.value);
            setLevel(null);
            setOverview(Boolean(event.target.value));
            setQuery('');
            setSelected(null);
          }}>
            <option value="">All buildings</option>
            {buildingNames.map(name => <option key={name}>{name}</option>)}
          </select>
          {error ? <div role="alert" className="message">
            <p>{error}</p>
            <button onClick={() => { setError(''); setAttempt(attempt + 1); }}>Try again</button>
          </div> : !directory ? <p role="status" className="message">Loading room directory…</p> : <>
            <p className="result-count" role="status">{results.length} {results.length === 1 ? 'result' : 'results'}</p>
            {results.length ? <ul className="results">
              {results.map(({ floor, room, key }) => <li key={key}>
                <button aria-pressed={key === selected} onClick={() => chooseRoom(key)}>
                  <span className="result-name">{room.name}</span>
                  <span className="result-meta">{floor.code || floor.building_name} · Level {floor.level}</span>
                </button>
              </li>)}
            </ul> : <p className="message">{query.trim()
              ? 'Check the room number or building and try again.'
              : 'No rooms are listed for this selection.'}</p>}
          </>}
        </section>
        <section ref={mapPanel} className="map-panel panel" aria-labelledby="map-title">
          <div className="map-heading">
            <div>
              <h2 id="map-title">{floor?.building_name ?? 'Floor map'}</h2>
              {floor && <p>Level {floor.level}{floor.code && ' · ' + floor.code}</p>}
            </div>
          </div>
          {room && <div className="room-details">
            <strong>{room.name}</strong>
            <span>{roomTypes[room.type] ?? room.type}{room.room_number && !normalized(room.name).split(' ').includes(normalized(room.room_number))
              ? ' · ' + room.room_number : ''}</span>
            <button className="save-button" aria-pressed={saved.includes(active.key)}
              onClick={() => toggleSaved(active.key)}>{saved.includes(active.key) ? 'Saved' : 'Save room'}</button>
          </div>}
          {floor ? <FloorPlan key={floor.id} floor={floor} room={room} />
            : <p className="map-empty">{directory ? 'Floor map unavailable.' : 'Map will appear when the directory loads.'}</p>}
        </section>
      </div>}
    </main>
    <nav className="bottom-nav" aria-label="Main navigation">
      {Object.entries({ Map: '⌖', Saved: '☆', Settings: '⚙' }).map(([label, icon]) =>
        <button key={label} aria-current={tab === label ? 'page' : undefined} onClick={() => {
          setTab(label);
          window.scrollTo(0, 0);
        }}><span aria-hidden="true">{icon}</span>{label}</button>
      )}
    </nav>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
