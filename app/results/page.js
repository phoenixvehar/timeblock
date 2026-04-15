'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Script from 'next/script';

function getDateFromTimeEntry(t) {
  if (t.HA instanceof Date) return t.HA.toISOString();
  if (t.HA && typeof t.HA === 'object' && t.HA.getFullYear) return t.HA.toISOString();
  const candidates = [t.bb, t.kh, t.Ef, t.eg, t.Lg, t.dateString];
  for (const c of candidates) {
    if (typeof c === 'string' && /^\d{4}/.test(c)) return c;
  }
  for (const val of Object.values(t)) {
    if (val instanceof Date) return val.toISOString();
    if (typeof val === 'string' && /^\d{4}-(0[1-9]|1[0-2])/.test(val)) return val;
  }
  return '';
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return 'Unknown';
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    if (/^\d{4}-\d{2}$/.test(dateStr)) {
      const [year, month] = dateStr.split('-');
      const d2 = new Date(parseInt(year), parseInt(month) - 1);
      return d2.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    return dateStr.substring(0, 4);
  } catch (e) {
    return dateStr.substring(0, 4);
  }
}

function ScoreCard({ score }) {
  const getTheme = (s) => {
    if (s <= 3) return { bg: 'linear-gradient(135deg, #450a0a, #7f1d1d)', accent: '#EF4444', light: '#FEE2E2' };
    if (s <= 6) return { bg: 'linear-gradient(135deg, #451a03, #78350f)', accent: '#F59E0B', light: '#FEF3C7' };
    return { bg: 'linear-gradient(135deg, #052e16, #14532d)', accent: '#22C55E', light: '#DCFCE7' };
  };
  const theme = getTheme(score.score);
  return (
    <div style={{
      background: theme.bg,
      borderRadius: '20px',
      padding: '32px',
      marginBottom: '28px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-40px', right: '-40px',
        width: '200px', height: '200px',
        background: `radial-gradient(circle, ${theme.accent}15 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap', position: 'relative' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '72px', fontWeight: '700', color: theme.accent,
            lineHeight: '1', fontFamily: "'DM Mono', monospace", letterSpacing: '-2px',
          }}>
            {score.score}
          </div>
          <div style={{
            fontSize: '11px', color: 'rgba(255,255,255,0.4)',
            fontFamily: "'DM Mono', monospace", letterSpacing: '1px', marginTop: '4px',
          }}>
            OUT OF 10
          </div>
        </div>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '8px', letterSpacing: '-0.5px' }}>
            {score.label}
          </div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: '1.5', marginBottom: '20px' }}>
            {score.justification}
          </div>
          <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${score.score * 10}%`,
              backgroundColor: theme.accent, borderRadius: '3px',
              transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: `0 0 12px ${theme.accent}60`,
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalysisPanel({ analysis }) {
  const lines = analysis.split('\n');
  return (
    <div style={{
      backgroundColor: '#ffffff', borderRadius: '20px',
      border: '1px solid #E2E8F0', overflow: 'hidden',
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        padding: '24px 32px', borderBottom: '1px solid #F1F5F9',
        background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <div style={{
          width: '36px', height: '36px',
          background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
          borderRadius: '10px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '16px',
          boxShadow: '0 4px 12px rgba(59,130,246,0.25)',
        }}>🤖</div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#0F172A' }}>AI Neighborhood Analysis</div>
          <div style={{ fontSize: '12px', color: '#94A3B8', fontFamily: "'DM Mono', monospace" }}>
            Powered by Claude AI · Visual evidence only
          </div>
        </div>
      </div>
      <div style={{ padding: '32px' }}>
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} style={{ height: '12px' }} />;
          const isHeader = /^[A-Z][A-Z\s&]{3,}$/.test(line.trim());
          if (isHeader) {
            return (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                marginTop: idx === 0 ? '0' : '28px', marginBottom: '10px',
              }}>
                <div style={{
                  width: '3px', height: '16px', backgroundColor: '#3B82F6',
                  borderRadius: '2px', flexShrink: 0,
                }} />
                <span style={{
                  fontSize: '11px', fontWeight: '600', color: '#3B82F6',
                  fontFamily: "'DM Mono', monospace", letterSpacing: '1.5px',
                }}>
                  {line.trim()}
                </span>
              </div>
            );
          }
          return (
            <p key={idx} style={{
              fontSize: '15px', color: '#334155', lineHeight: '1.75', marginBottom: '4px',
            }}>
              {line}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function StreetViewTimeline({ lat, lng, apiKey, onImagesReady }) {
  const panoramaRef = useRef(null);
  const panoramaInstanceRef = useRef(null);
  const [historicalImages, setHistoricalImages] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!lat || !lng) return;
    if (!window.google || !window.google.maps) {
      setTimeout(() => {
        if (window.google && window.google.maps) initPanorama();
        else setStatus('error');
      }, 3000);
      return;
    }
    initPanorama();
  }, [lat, lng]);

  const initPanorama = () => {
    const sv = new window.google.maps.StreetViewService();
    sv.getPanorama({
      location: { lat, lng },
      radius: 50,
      source: window.google.maps.StreetViewSource.OUTDOOR,
    }, (data, svStatus) => {
      if (svStatus !== 'OK' || !data) { setStatus('error'); return; }

      const times = data.time || [];
      let images = [];

      if (times.length > 1) {
        const sorted = [...times].sort((a, b) =>
          getDateFromTimeEntry(a).localeCompare(getDateFromTimeEntry(b))
        );
        const indices = sorted.length <= 4
          ? sorted.map((_, i) => i)
          : [0, Math.floor(sorted.length * 0.33), Math.floor(sorted.length * 0.66), sorted.length - 1];

        images = indices.map(i => {
          const t = sorted[i];
          const dateStr = getDateFromTimeEntry(t);
          return {
            panoId: t.pano,
            date: dateStr,
            displayDate: formatDisplayDate(dateStr),
            year: dateStr ? parseInt(dateStr.substring(0, 4)) : 'Unknown',
            url: `https://maps.googleapis.com/maps/api/streetview?size=800x500&pano=${t.pano}&fov=90&pitch=0&key=${apiKey}`,
          };
        });
        setStatus('historical');
      } else {
        const panoId = data.location.pano;
        const dateStr = data.imageDate || '';
        const year = dateStr ? parseInt(dateStr.substring(0, 4)) : 2024;
        images = [0, 90, 180, 270].map((heading, i) => ({
          panoId,
          date: dateStr,
          displayDate: `${year} · ${['N', 'E', 'S', 'W'][i]}`,
          year,
          heading,
          url: `https://maps.googleapis.com/maps/api/streetview?size=800x500&pano=${panoId}&fov=90&heading=${heading}&pitch=0&key=${apiKey}`,
        }));
        setStatus('angles');
      }

      setHistoricalImages(images);
      if (onImagesReady) onImagesReady(images);
    });
  };

  useEffect(() => {
    if (!panoramaRef.current || historicalImages.length === 0) return;
    if (!window.google || !window.google.maps) return;
    const current = historicalImages[selectedIndex];
    if (!current?.panoId) return;

    if (!panoramaInstanceRef.current) {
      panoramaInstanceRef.current = new window.google.maps.StreetViewPanorama(panoramaRef.current, {
        pano: current.panoId,
        pov: { heading: current.heading || 0, pitch: 0 },
        zoom: 1,
        addressControl: false,
        showRoadLabels: false,
        motionTracking: false,
        motionTrackingControl: false,
        fullscreenControl: true,
        enableCloseButton: false,
      });
    } else {
      panoramaInstanceRef.current.setPano(current.panoId);
      panoramaInstanceRef.current.setPov({ heading: current.heading || 0, pitch: 0 });
    }
  }, [selectedIndex, historicalImages]);

  const current = historicalImages[selectedIndex];

  const getStatusBar = () => {
    if (historicalImages.length === 0) return null;

    if (status === 'angles') {
      return {
        bg: 'rgba(245,158,11,0.06)',
        border: 'rgba(245,158,11,0.15)',
        icon: '⚠️',
        color: '#B45309',
        message: 'NO HISTORICAL DATA AVAILABLE — Showing 4 directions of current Street View. AI analysis will reflect current conditions only.',
      };
    }

    const oldest = historicalImages[0]?.displayDate;
    const newest = historicalImages[historicalImages.length - 1]?.displayDate;
    const count = historicalImages.length;

    if (count === 1) {
      return {
        bg: 'rgba(245,158,11,0.06)',
        border: 'rgba(245,158,11,0.15)',
        icon: '⚠️',
        color: '#B45309',
        message: `LIMITED HISTORY — Only 1 capture found (${oldest}). Analysis will have limited historical comparison.`,
      };
    }

    if (count === 2 || count === 3) {
      return {
        bg: 'rgba(59,130,246,0.06)',
        border: 'rgba(59,130,246,0.15)',
        icon: 'ℹ️',
        color: '#1D4ED8',
        message: `PARTIAL HISTORY — ${count} captures found from ${oldest} to ${newest}. Some gaps in the timeline.`,
      };
    }

    return {
      bg: 'rgba(34,197,94,0.06)',
      border: 'rgba(34,197,94,0.15)',
      icon: '✅',
      color: '#15803D',
      message: `FULL HISTORY — ${count} captures from ${oldest} to ${newest}. Ideal for historical analysis.`,
    };
  };

  const statusBar = getStatusBar();

  return (
    <div style={{
      backgroundColor: '#ffffff', borderRadius: '20px',
      border: '1px solid #E2E8F0', overflow: 'hidden',
      marginBottom: '28px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    }}>

      {/* Main viewer */}
      <div style={{ position: 'relative', backgroundColor: '#0A0F1E', height: 'clamp(300px, 55vw, 520px)' }}>
        <div ref={panoramaRef} style={{
          width: '100%', height: '100%',
          display: historicalImages.length > 0 ? 'block' : 'none',
        }} />

        {status === 'loading' && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #080D1A, #0D1526)',
          }}>
            <div style={{
              width: '40px', height: '40px',
              border: '3px solid rgba(59,130,246,0.2)',
              borderTop: '3px solid #3B82F6', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', marginBottom: '16px',
            }} />
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontFamily: "'DM Mono', monospace", letterSpacing: '1px' }}>
              LOADING STREET VIEW
            </p>
          </div>
        )}

        {status === 'error' && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #080D1A, #0D1526)',
            gap: '12px',
          }}>
            <span style={{ fontSize: '32px' }}>📍</span>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', textAlign: 'center', maxWidth: '300px', lineHeight: '1.6' }}>
              Street View is unavailable for this location. Try a major city address for best results.
            </p>
          </div>
        )}

        {current && (
          <div style={{
            position: 'absolute', top: '16px', left: '16px',
            backgroundColor: 'rgba(8,13,26,0.85)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff', padding: '6px 14px', borderRadius: '20px',
            fontSize: '13px', fontWeight: '500',
            fontFamily: "'DM Mono', monospace",
            zIndex: 10, pointerEvents: 'none',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            {current.displayDate}
          </div>
        )}

        {historicalImages.length > 0 && (
          <div style={{
            position: 'absolute', bottom: '16px', left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(8,13,26,0.75)',
            backdropFilter: 'blur(8px)',
            color: 'rgba(255,255,255,0.5)',
            padding: '5px 14px', borderRadius: '12px',
            fontSize: '11px', fontFamily: "'DM Mono', monospace",
            zIndex: 10, pointerEvents: 'none',
            border: '1px solid rgba(255,255,255,0.06)',
            letterSpacing: '0.5px',
          }}>
            DRAG TO LOOK AROUND
          </div>
        )}
      </div>

      {/* Status message bar */}
      {statusBar && (
        <div style={{
          padding: '10px 16px',
          backgroundColor: statusBar.bg,
          borderBottom: `1px solid ${statusBar.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '13px', flexShrink: 0 }}>{statusBar.icon}</span>
          <span style={{
            fontSize: '11px',
            color: statusBar.color,
            fontFamily: "'DM Mono', monospace",
            letterSpacing: '0.3px',
            lineHeight: '1.5',
          }}>
            {statusBar.message}
          </span>
        </div>
      )}

      {/* Timeline thumbnails */}
      {historicalImages.length > 0 && (
        <div style={{
          display: 'flex', padding: '12px', gap: '8px',
          overflowX: 'auto', backgroundColor: '#F8FAFC',
          borderTop: statusBar ? 'none' : '1px solid #E2E8F0',
        }}>
          {historicalImages.map((img, idx) => (
            <button key={idx} onClick={() => setSelectedIndex(idx)} style={{
              flex: '1', minWidth: '110px', padding: '0',
              border: selectedIndex === idx ? '2px solid #3B82F6' : '2px solid transparent',
              borderRadius: '10px', overflow: 'hidden',
              cursor: 'pointer', backgroundColor: 'transparent',
              transition: 'all 0.15s ease',
              boxShadow: selectedIndex === idx ? '0 0 0 3px rgba(59,130,246,0.15)' : 'none',
            }}>
              <img src={img.url} alt={img.displayDate} style={{
                width: '100%', height: '72px', objectFit: 'cover',
                display: 'block', opacity: selectedIndex === idx ? 1 : 0.55,
                transition: 'opacity 0.15s ease',
              }} />
              <div style={{
                padding: '5px 6px',
                backgroundColor: selectedIndex === idx ? '#3B82F6' : '#ffffff',
                color: selectedIndex === idx ? '#ffffff' : '#64748B',
                fontSize: '11px', fontWeight: '500', textAlign: 'center',
                fontFamily: "'DM Mono', monospace", letterSpacing: '0.3px',
              }}>
                {img.displayDate}
              </div>
            </button>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const address = searchParams.get('address');

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [score, setScore] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [mapsReady, setMapsReady] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  useEffect(() => {
    if (!address) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/streetview?address=${encodeURIComponent(address)}`);
        const json = await res.json();
        if (!res.ok) { setError(json.error || 'Something went wrong.'); return; }
        setData(json);
      } catch (err) {
        setError('Failed to load Street View data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [address]);

  const runAnalysis = async () => {
    if (!images || images.length === 0) return;
    try {
      setAnalyzing(true);
      setAnalysisError(null);
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images, address: data?.address || address }),
      });
      const json = await res.json();
      if (!res.ok) { setAnalysisError(json.error || 'Analysis failed.'); return; }
      setAnalysis(json.analysis);
      setScore(json.score);
    } catch (err) {
      setAnalysisError('Failed to run analysis. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #060B18 0%, #0A1020 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{
          width: '48px', height: '48px',
          border: '3px solid rgba(59,130,246,0.15)',
          borderTop: '3px solid #3B82F6', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', marginBottom: '24px',
        }} />
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontFamily: "'DM Mono', monospace", letterSpacing: '1px', marginBottom: '8px' }}>
          FETCHING STREET VIEW HISTORY
        </p>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>{address}</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #060B18 0%, #0A1020 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif",
        padding: '24px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📍</div>
        <h2 style={{ color: '#ffffff', fontSize: '22px', fontWeight: '600', marginBottom: '12px' }}>No imagery found</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', maxWidth: '440px', marginBottom: '32px', lineHeight: '1.6' }}>{error}</p>
        <a href="/" style={{
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
          color: '#ffffff', borderRadius: '10px',
          textDecoration: 'none', fontWeight: '600', fontSize: '14px',
        }}>← Try another address</a>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: "'DM Sans', sans-serif" }}>

      <Script
        id="google-maps-script"
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`}
        onLoad={() => setMapsReady(true)}
      />

      {/* Header */}
      <div style={{
        background: 'linear-gradient(160deg, #060B18 0%, #0D1526 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          padding: '16px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '32px', height: '32px',
              background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              borderRadius: '8px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '15px',
            }}>⏱</div>
            <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600' }}>TimeBlock</span>
          </a>
          <a href="/" style={{
            color: 'rgba(255,255,255,0.3)', fontSize: '13px', textDecoration: 'none',
            fontFamily: "'DM Mono', monospace", letterSpacing: '0.5px', transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.3)'}
          >
            ← NEW SEARCH
          </a>
        </div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '8px 32px 32px' }}>
          <h1 style={{
            color: '#ffffff', fontSize: 'clamp(18px, 3vw, 28px)',
            fontWeight: '600', letterSpacing: '-0.5px', marginBottom: '6px',
          }}>
            {data?.address}
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.25)', fontSize: '12px',
            fontFamily: "'DM Mono', monospace", letterSpacing: '1px',
          }}>
            STREET VIEW ANALYSIS · {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>

        {score && <ScoreCard score={score} />}

        {data && mapsReady && (
          <StreetViewTimeline
            lat={data.lat}
            lng={data.lng}
            apiKey={apiKey}
            onImagesReady={(imgs) => setImages(imgs)}
          />
        )}

        {data && !mapsReady && (
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '20px',
            border: '1px solid #E2E8F0', marginBottom: '28px',
            height: '400px', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '36px', height: '36px',
                border: '3px solid rgba(59,130,246,0.2)',
                borderTop: '3px solid #3B82F6', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
              }} />
              <p style={{ color: '#94A3B8', fontSize: '12px', fontFamily: "'DM Mono', monospace", letterSpacing: '1px' }}>
                LOADING MAPS
              </p>
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!analysis && !analyzing && images.length > 0 && (
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '20px',
            border: '1px solid #E2E8F0', padding: '40px',
            textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            marginBottom: '28px',
          }}>
            <div style={{
              width: '52px', height: '52px',
              background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              borderRadius: '14px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', margin: '0 auto 16px',
              boxShadow: '0 8px 24px rgba(59,130,246,0.25)',
            }}>🤖</div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', marginBottom: '8px', letterSpacing: '-0.3px' }}>
              Ready to analyze
            </h2>
            <p style={{ color: '#64748B', fontSize: '14px', maxWidth: '380px', margin: '0 auto 24px', lineHeight: '1.6' }}>
              Claude AI will review all {images.length} Street View images and generate a full CRE neighborhood report.
            </p>
            <button onClick={runAnalysis} style={{
              padding: '13px 32px',
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              color: '#ffffff', border: 'none', borderRadius: '10px',
              cursor: 'pointer', fontSize: '15px', fontWeight: '600',
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Run AI Analysis →
            </button>
          </div>
        )}

        {analyzing && (
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '20px',
            border: '1px solid #E2E8F0', padding: '48px',
            textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            marginBottom: '28px',
          }}>
            <div style={{
              width: '40px', height: '40px',
              border: '3px solid rgba(59,130,246,0.2)',
              borderTop: '3px solid #3B82F6', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
            }} />
            <p style={{ color: '#0F172A', fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>
              Analyzing neighborhood changes...
            </p>
            <p style={{ color: '#94A3B8', fontSize: '13px', fontFamily: "'DM Mono', monospace" }}>
              REVIEWING {images.length} IMAGES · ~20 SECONDS
            </p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {analysisError && (
          <div style={{
            backgroundColor: '#FEF2F2', borderRadius: '16px',
            border: '1px solid #FECACA', padding: '24px',
            marginBottom: '28px', textAlign: 'center',
          }}>
            <p style={{ color: '#DC2626', fontSize: '14px', marginBottom: '12px' }}>{analysisError}</p>
            <button onClick={runAnalysis} style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              color: '#ffffff', border: 'none', borderRadius: '8px',
              cursor: 'pointer', fontSize: '14px', fontWeight: '600',
            }}>Retry Analysis</button>
          </div>
        )}

        {analysis && <AnalysisPanel analysis={analysis} />}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #060B18, #0A1020)' }} />}>
      <ResultsContent />
    </Suspense>
  );
}