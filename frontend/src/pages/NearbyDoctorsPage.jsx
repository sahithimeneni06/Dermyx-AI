// src/pages/NearbyDoctorsPage.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Pages.css';
import './NearbyDoctors.css';

const DISPLAY_NAMES = {
  acne: 'Acne',
  eczema_like: 'Eczema / Dermatitis',
  fungal: 'Fungal Infection',
  melanoma: 'Melanoma (Skin Cancer)',
  vitiligo: 'Vitiligo',
  normal: 'Normal Skin',
};

// Always derive display name from condition key — never trust stored display_name
const getDisplayName = (condition) =>
  DISPLAY_NAMES[condition] ||
  (condition
    ? condition.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Skin Condition');

/* ─── helper: compute distance (km) with Haversine ───────────────── */
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ─── status indicator ─────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const cfg = {
    open: { icon: '🟢', label: 'Open Now', cls: 'status-open' },
    closed: { icon: '🔴', label: 'Closed', cls: 'status-closed' },
    unknown: { icon: '⚪', label: 'Hours Unknown', cls: 'status-unknown' },
  };
  const { icon, label, cls } = cfg[status] ?? cfg.unknown;
  return <span className={`status-badge ${cls}`}>{icon} {label}</span>;
};

/* ─── single doctor card ───────────────────────────────────────────── */
const DoctorCard = ({ doctor, userLat, userLon, index, detectedCondition }) => {
  const dist = haversineKm(userLat, userLon, doctor.lat, doctor.lon);
  const mapsUrl = `https://www.openstreetmap.org/?mlat=${doctor.lat}&mlon=${doctor.lon}#map=17/${doctor.lat}/${doctor.lon}`;
  const dirUrl = `https://www.google.com/maps/dir/${userLat},${userLon}/${doctor.lat},${doctor.lon}`;

  const isSpecialist =
    doctor.speciality &&
    (doctor.speciality.includes(detectedCondition?.toLowerCase()) ||
      (detectedCondition === 'melanoma' && doctor.speciality.includes('oncology')) ||
      (detectedCondition === 'acne' && doctor.speciality.includes('acne')) ||
      (detectedCondition === 'eczema_like' && doctor.speciality.includes('eczema')) ||
      (detectedCondition === 'fungal' && doctor.speciality.includes('fungal')));

  const typeIcon =
    doctor.type === 'hospital'
      ? '🏥'
      : doctor.type === 'clinic'
      ? '🏨'
      : isSpecialist
      ? '🔬'
      : '👨‍⚕️';

  return (
    <div className="doctor-card" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="doctor-card-header">
        <div className="doctor-icon-wrap">
          <span className="doctor-icon">{typeIcon}</span>
          <span className="doctor-rank">#{index + 1}</span>
        </div>
        <div className="doctor-meta">
          <h3 className="doctor-name">{doctor.name}</h3>
          <div className="doctor-tags">
            {doctor.speciality && (
              <span className={`tag tag-specialty ${isSpecialist ? 'tag-specialist' : ''}`}>
                {doctor.speciality}
              </span>
            )}
            <span className="tag tag-type">{doctor.type || 'clinic'}</span>
            {isSpecialist && (
              <span className="tag tag-specialist-badge">⭐ Specialist</span>
            )}
          </div>
        </div>
        <div className="doctor-dist">
          <span className="dist-value">{dist.toFixed(1)}</span>
          <span className="dist-unit">km</span>
        </div>
      </div>

      {doctor.address && <p className="doctor-address">📍 {doctor.address}</p>}
      {doctor.phone && (
        <p className="doctor-phone">
          📞 <a href={`tel:${doctor.phone}`}>{doctor.phone}</a>
        </p>
      )}
      {doctor.opening_hours && (
        <p className="doctor-hours">🕒 {doctor.opening_hours}</p>
      )}

      <div className="doctor-footer">
        <StatusBadge status={doctor.opening_hours ? 'open' : 'unknown'} />
        <div className="doctor-actions">
          <a
            href={dirUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-doctor btn-directions"
          >
            🗺️ Directions
          </a>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-doctor btn-map"
          >
            📌 View Map
          </a>
        </div>
      </div>
    </div>
  );
};

/* ─── Condition banner ────────────────────────────────────────────── */
const ConditionBanner = ({ condition, displayName, riskLevel, requiresDoctor }) => {
  const riskColors = {
    HIGH: '#dc2626',
    'MODERATE-HIGH': '#ea580c',
    MODERATE: '#d97706',
    'LOW-MODERATE': '#ca8a04',
    LOW: '#16a34a',
  };
  const color = riskColors[riskLevel] || '#6b7280';

  return (
    <div
      className="condition-banner"
      style={{
        background: `linear-gradient(135deg, ${color}10 0%, white 100%)`,
        borderLeft: `4px solid ${color}`,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '2rem' }}>🔬</span>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>
            Detected Condition:{' '}
            <span style={{ color, fontWeight: 'bold' }}>{displayName}</span>
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '.85rem', color: '#6b7280' }}>
            Risk Level: <span style={{ color, fontWeight: '500' }}>{riskLevel}</span>
            {requiresDoctor && ' · ⚕️ Medical attention recommended'}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span
            style={{
              background: color,
              color: 'white',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '.75rem',
              fontWeight: '600',
            }}
          >
            {requiresDoctor ? 'Urgent Care' : 'Treatment Available'}
          </span>
        </div>
      </div>
      <p style={{ margin: '12px 0 0 0', fontSize: '.9rem', color: '#374151' }}>
        {requiresDoctor
          ? `⚠️ Your detected condition (${displayName}) requires professional medical attention. Below are nearby skin specialists who can help.`
          : `Based on your detected condition (${displayName}), we've found nearby skin specialists who can provide appropriate treatment.`}
      </p>
    </div>
  );
};

/* ─── Main Page Component ──────────────────────────────────────────── */
const NearbyDoctorsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [phase, setPhase] = useState('idle');
  const [userPos, setUserPos] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [radius, setRadius] = useState(10);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('distance');
  const abortRef = useRef(null);
  const [dermatologistCount, setDermatologistCount] = useState(0);

  const API_BASE_URL =
    typeof process !== 'undefined' && process.env
      ? process.env.REACT_APP_API_URL || 'http://localhost:5000'
      : 'http://localhost:5000';

  const [detectedCondition, setDetectedCondition] = useState(null);
  const [conditionInfo, setConditionInfo] = useState(null);
  const [fromPage, setFromPage] = useState(null);

  useEffect(() => {
    // Always nuke stale nearbyDoctorsCondition immediately
    localStorage.removeItem('nearbyDoctorsCondition');

    let condition = null;
    let conditionData = null;
    let sourcePage = null;

    // ── PRIORITY 1: location.state — freshest, set directly by ResultsPage ──
    if (location.state?.detectedCondition) {
      condition = location.state.detectedCondition;
      sourcePage = location.state.fromPage;

      // Re-derive display_name from condition — don't trust what was passed
      const passedInfo = location.state.conditionInfo || {};
      conditionData = {
        ...passedInfo,
        display_name: getDisplayName(condition),
        risk_level:
          condition === 'melanoma' ? 'HIGH' : condition === 'normal' ? 'LOW' : passedInfo.risk_level || 'MODERATE',
        requires_doctor: condition === 'melanoma' ? true : passedInfo.requires_doctor || false,
      };

      console.log('✅ PRIORITY 1 - location.state condition:', condition, conditionData);
      setDetectedCondition(condition);
      setConditionInfo(conditionData);
      setFromPage(sourcePage);
      return; // Stop — don't fall through to stale localStorage
    }

    // ── PRIORITY 2: diseaseResult localStorage ──
    if (!condition) {
      const diseaseResult = localStorage.getItem('diseaseResult');
      if (diseaseResult) {
        try {
          const parsed = JSON.parse(diseaseResult);
          const resultData = parsed.data || parsed;
          const det = resultData.prediction || resultData.condition;
          console.log('🔍 PRIORITY 2 - diseaseResult condition:', det);
          if (det && det !== 'unknown') {
            condition = det;
            conditionData = {
              display_name: getDisplayName(det),
              risk_level: det === 'melanoma' ? 'HIGH' : det === 'normal' ? 'LOW' : 'MODERATE',
              requires_doctor: det === 'melanoma',
              confidence: resultData.confidence || 0,
              category: det === 'melanoma' ? 'melanoma' : 'disease',
            };
            sourcePage = 'disease';
          }
        } catch (e) {
          console.error('Error parsing diseaseResult:', e);
        }
      }
    }

    // ── PRIORITY 3: symptomResult localStorage ──
    if (!condition) {
      const symptomResult = localStorage.getItem('symptomResult');
      if (symptomResult) {
        try {
          const parsed = JSON.parse(symptomResult);
          const resultData = parsed.data || parsed;
          const det = resultData.inferred_condition || resultData.condition;
          if (det && det !== 'unknown') {
            condition = det;
            conditionData = {
              display_name: getDisplayName(det),
              risk_level: resultData.risk || 'MODERATE',
              requires_doctor: resultData.recommendations?.requires_doctor || false,
              confidence: resultData.confidence || 0,
              category: 'disease',
            };
            sourcePage = 'symptoms';
            console.log('✅ PRIORITY 3 - symptomResult condition:', condition);
          }
        } catch (e) {
          console.error('Error parsing symptomResult:', e);
        }
      }
    }

    // ── PRIORITY 4: allergyResult localStorage ──
    if (!condition) {
      const allergyResult = localStorage.getItem('allergyResult');
      if (allergyResult) {
        try {
          const parsed = JSON.parse(allergyResult);
          const resultData = parsed.data || parsed;
          const det = resultData.prediction || resultData.condition;
          if (det && det !== 'unknown') {
            condition = det;
            conditionData = {
              display_name: getDisplayName(det),
              risk_level: 'MODERATE',
              requires_doctor: false,
              confidence: resultData.confidence || 0,
              category: 'allergy',
            };
            sourcePage = 'allergy';
            console.log('✅ PRIORITY 4 - allergyResult condition:', condition);
          }
        } catch (e) {
          console.error('Error parsing allergyResult:', e);
        }
      }
    }

    // ── Fallback ──
    if (!condition || condition === 'unknown') {
      console.warn('⚠️ No skin condition detected, using fallback');
      condition = 'unknown';
      conditionData = {
        display_name: 'Skin Condition',
        risk_level: 'MODERATE',
        requires_doctor: false,
        confidence: 0,
      };
    }

    console.log('🎯 FINAL condition:', condition, conditionData);
    setDetectedCondition(condition);
    setConditionInfo(conditionData);
    setFromPage(sourcePage);
  }, [location.state]);

  /* ── locate user ─────────────────────────────────────────────── */
  const locateUser = useCallback(() => {
    if (!navigator.geolocation) {
      setPhase('error');
      setErrorMsg(
        'Geolocation is not supported by your browser. Please try a modern browser like Chrome or Firefox.'
      );
      return;
    }

    setPhase('locating');
    setDoctors([]);
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setUserPos(coords);
        fetchDoctors(coords, radius);
      },
      (err) => {
        setPhase('error');
        const messages = {
          1: 'Location access denied. Please allow location access in your browser settings and try again.',
          2: 'Location unavailable. Make sure your device has GPS enabled.',
          3: 'Location request timed out. Please try again.',
        };
        setErrorMsg(messages[err.code] || `Geolocation error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [radius]);

  const fetchDoctors = async (coords, radiusKm) => {
    setPhase('searching');
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    const { lat, lon } = coords;

    try {
      console.log(`🔍 Fetching doctors near: ${lat}, ${lon}, radius: ${radiusKm}km`);

      const response = await fetch(
        `${API_BASE_URL}/api/location/nearby-doctors?lat=${lat}&lon=${lon}&radius=${radiusKm}`,
        { signal: abortRef.current.signal }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      let allDoctors = data.results || [];
      const dermCount = data.dermatologists || 0;

      console.log(`📊 Found ${allDoctors.length} doctors (${dermCount} dermatologists)`);

      allDoctors.sort((a, b) => {
        const distA = haversineKm(lat, lon, a.lat, a.lon);
        const distB = haversineKm(lat, lon, b.lat, b.lon);
        return distA - distB;
      });

      setDoctors(allDoctors.slice(0, 50));
      setDermatologistCount(dermCount);

      if (allDoctors.length === 0) {
        setErrorMsg(
          `No medical facilities found within ${radiusKm}km. Try increasing the search radius or check your location.`
        );
      } else if (dermCount === 0 && allDoctors.length > 0) {
        setErrorMsg(
          `ℹ️ Found ${allDoctors.length} medical facilities but no specific dermatologists. These facilities may still help with your condition.`
        );
        setTimeout(() => setErrorMsg(''), 5000);
      }

      setPhase('done');
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('❌ Fetch failed:', err);
      setPhase('error');
      setErrorMsg(
        err.message.includes('HTTP')
          ? err.message
          : 'Could not reach the server. Please check your internet connection and try again.'
      );
    }
  };

  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius);
    if (userPos) fetchDoctors(userPos, newRadius);
  };

  const handleBackToResults = () => {
    if (fromPage) navigate(`/results/${fromPage}`);
    else navigate(-1);
  };

  const handleGoogleMapsSearch = () => {
    if (userPos) {
      window.open(
        `https://www.google.com/maps/search/${encodeURIComponent('dermatologist near me')}/@${userPos.lat},${userPos.lon},12z`,
        '_blank'
      );
    } else {
      window.open('https://www.google.com/maps/search/dermatologist+near+me', '_blank');
    }
  };

  const filteredDoctors = doctors
    .filter((d) => {
      if (filter === 'all') return true;
      if (filter === 'dermatology')
        return (
          d.speciality?.toLowerCase().includes('dermatol') ||
          d.name?.toLowerCase().includes('dermatol') ||
          d.name?.toLowerCase().includes('skin')
        );
      if (filter === 'hospital') return d.type === 'hospital';
      if (filter === 'clinic') return d.type === 'clinic' || d.type === 'doctor';
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'distance' && userPos) {
        const da = haversineKm(userPos.lat, userPos.lon, a.lat, a.lon);
        const db = haversineKm(userPos.lat, userPos.lon, b.lat, b.lon);
        return da - db;
      }
      return a.name?.localeCompare(b.name ?? '') ?? 0;
    });

  if (!detectedCondition && phase === 'idle') {
    return (
      <main className="page-main nd-page">
        <div className="nd-loading">
          <div className="nd-pulse-ring" />
          <div className="nd-pulse-ring nd-pulse-ring--2" />
          <span className="nd-loading-icon">🔍</span>
          <p className="nd-loading-text">Checking for detected skin condition...</p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-secondary"
            style={{ marginTop: '20px' }}
          >
            ← Back to Home
          </button>
        </div>
      </main>
    );
  }

  // Always derive display name fresh from condition key — never trust stored display_name
  const conditionDisplayName = getDisplayName(detectedCondition);

  return (
    <main className="page-main nd-page">
      <div className="page-header">
        <h1 className="page-title">🔬 Find Skin Specialists Near You</h1>
        <p className="page-description">
          Based on your detected condition, we've found dermatologists and skin specialists in your area.
        </p>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={handleBackToResults}
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          ←Back to{' '}
          {fromPage === 'disease'
            ? 'Disease'
            : fromPage === 'symptoms'
            ? 'Symptom'
            : 'Analysis'}{' '}
          Results
        </button>

        <button
          onClick={handleGoogleMapsSearch}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#4285F4' }}
        >
          🗺️ Search on Google Maps
        </button>
      </div>

      {detectedCondition && detectedCondition !== 'unknown' && (
        <ConditionBanner
          condition={detectedCondition}
          displayName={conditionDisplayName}
          riskLevel={conditionInfo?.risk_level || 'MODERATE'}
          requiresDoctor={conditionInfo?.requires_doctor || false}
        />
      )}

      <div className="nd-controls page-content">
        <div className="nd-radius-row">
          <label className="nd-label">Search radius:</label>
          <div className="nd-radius-pills">
            {[2, 5, 10, 20, 30, 50].map((r) => (
              <button
                key={r}
                onClick={() => handleRadiusChange(r)}
                className={`nd-pill ${radius === r ? 'nd-pill-active' : ''}`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={locateUser}
          className="btn btn-primary nd-locate-btn"
          disabled={phase === 'locating' || phase === 'searching'}
        >
          {phase === 'locating' && '📡 Getting your location…'}
          {phase === 'searching' && '🔍 Searching for skin specialists…'}
          {(phase === 'idle' || phase === 'done' || phase === 'error') &&
            '📍 Find Nearby Skin Specialists'}
        </button>
      </div>

      {(phase === 'locating' || phase === 'searching') && (
        <div className="nd-loading">
          <div className="nd-pulse-ring" />
          <div className="nd-pulse-ring nd-pulse-ring--2" />
          <span className="nd-loading-icon">📡</span>
          <p className="nd-loading-text">
            {phase === 'locating'
              ? 'Acquiring GPS signal…'
              : `Searching for skin specialists within ${radius} km…`}
          </p>
        </div>
      )}

      {phase === 'error' && (
        <div className="nd-error">
          <span className="nd-error-icon">⚠️</span>
          <div>
            <strong>Could not complete search</strong>
            <p>{errorMsg}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button className="btn btn-primary nd-retry-btn" onClick={locateUser}>
              🔄 Retry
            </button>
            <button className="btn btn-secondary" onClick={handleGoogleMapsSearch}>
              🗺️ Search Google Maps
            </button>
            <button className="btn btn-secondary" onClick={handleBackToResults}>
              ← Back to Results
            </button>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <>
          <div className="nd-results-bar">
            <span className="nd-count">
              {filteredDoctors.length} medical{' '}
              {filteredDoctors.length === 1 ? 'facility' : 'facilities'} found
              {dermatologistCount > 0 &&
                ` (${dermatologistCount} dermatologist${dermatologistCount !== 1 ? 's' : ''})`}
            </span>
            <div className="nd-filters">
              {['all', 'dermatology', 'hospital', 'clinic'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`nd-filter-btn ${filter === f ? 'active' : ''}`}
                >
                  {f === 'all'
                    ? 'All'
                    : f === 'dermatology'
                    ? '🔬 Dermatologists'
                    : f === 'hospital'
                    ? '🏥 Hospitals'
                    : '🏨 Clinics'}
                </button>
              ))}
            </div>
            <select
              className="nd-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="distance">Sort: Nearest first</option>
              <option value="name">Sort: A–Z</option>
            </select>
          </div>

          {filteredDoctors.length === 0 ? (
            <div className="nd-empty">
              <span>🏙️</span>
              <h3>No medical facilities found nearby</h3>
              <p>
                We couldn't find dermatologists in our database for your area. Try these options:
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'center',
                  marginTop: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  className="btn btn-primary"
                  onClick={() => handleRadiusChange(Math.min(radius + 10, 50))}
                >
                  🔍 Expand to {Math.min(radius + 10, 50)} km
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleGoogleMapsSearch}
                  style={{ background: '#4285F4' }}
                >
                  🗺️ Search Google Maps
                </button>
                <button className="btn btn-secondary" onClick={handleBackToResults}>
                  ← Back to Results
                </button>
              </div>
              <p style={{ marginTop: '20px', fontSize: '.8rem', color: '#6b7280' }}>
                💡 Tip: You can also search for "dermatologist near me" on Google or consider
                online consultations.
              </p>
            </div>
          ) : (
            <>
              {dermatologistCount === 0 && doctors.length > 0 && (
                <div
                  className="nd-tip-banner"
                  style={{
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>💡</span>
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: '#92400e' }}>No dermatologists found</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#78350f' }}>
                      The following medical facilities may still help with your condition. Call
                      ahead to ask if they have dermatology services.
                    </p>
                  </div>
                </div>
              )}

              <div className="nd-list">
                {filteredDoctors.map((doc, i) => (
                  <DoctorCard
                    key={doc.id ?? i}
                    doctor={doc}
                    userLat={userPos.lat}
                    userLon={userPos.lon}
                    index={i}
                    detectedCondition={detectedCondition}
                  />
                ))}
              </div>
            </>
          )}

          <p className="nd-attribution">
            Data ©{' '}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
            >
              OpenStreetMap
            </a>{' '}
            contributors
          </p>
        </>
      )}
    </main>
  );
};

export default NearbyDoctorsPage;