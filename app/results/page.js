'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Script from 'next/script';

function ScoreCard({ score }) {
  const getColor = (s) => {
    if (s <= 3) return { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626', bar: '#EF4444' };
    if (s <= 6) return { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706', bar: '#F59E0B' };
    return { bg: '#F0FDF4', border: '#BBF7D0', text: '#16A34A', bar: '#22C55E' };
  };
  const colors = getColor(score.score);
  return (
    <div style={{
      backgroundColor: colors.bg, border: `1px solid ${colors.border}`,
      borderRadius: '16px', padding: '32px', marginBottom: '32px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center', minWidth: '80px' }}>
          <div style={{ fontSize: '56px', fontWeight: '800', color: colors.text, lineHeight: '1' }}>
            {score.score}
          </div>
          <div style={{ fontSize: '12px', color: colors.text, opacity: 0.7, marginTop: '4px' }}>out of 10</div>
        </div>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <div style={{ fontSize: '22px', fontWeight: '700', color: colors.text, marginBottom: '6px' }}>
            {score.label}
          </div>
          <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px', lineHeight: '1.5' }}>
            {score.justification}
          </div>
          <div style={{ height: '8px', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${score.score * 10}%`,
              backgroundColor: colors.bar, borderRadius: '4px', transition: 'width 1s ease',
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalysisPanel({ analysis }) {
  return (
    <div style={{
      backgroundColor: '#ffffff', borderRadius: '16px',
      border: '1px solid #E5E7EB', overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    }}>
      <div style={{ padding: '24px 32px', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0A0F1E' }}>🤖 AI Neighborhood Analysis</h2>
        <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>Powered by Claude AI · Based on visual evidence only</p>
      </div>
      <div style={{ padding: '32px' }}>
        {analysis.split('\n').map((line, idx) => {
          if (!line.trim()) return <div key={idx} style={{ height: '8px' }} />;
          const isHeader = /^\d+\.|^#+\s|^[A-Z\s&]{4,}:/.test(line.trim());
          return (
            <p key={idx} style={{
              fontSize: '15px', fontWeight: isHeader ? '700' : '400',
              color: isHeader ? '#0A0F1E' : '#374151',
              lineHeight: '1.7', marginBottom: isHeader ? '8px' : '4px',
              marginTop: isHeader ? '24px' : '0',
            }}>
              {line.replace(/^#+\s/, '')}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function getDateFromTimeEntry(t) {
  // HA is a Date object in current Google Maps API
  if (t.HA instanceof Date) return t.HA.toISOString();
  if (t.HA && typeof t.HA === 'object' && t.HA.getFullYear) return t.HA.toISOString();
  // Try string candidates
  const candidates = [t.bb, t.kh, t.Ef, t.eg, t.Lg, t.dateString];
  for (const c of candidates) {
    if (typeof c === 'string' && /^\d{4}/.test(c)) return c;
  }
  // Scan all values
  for (const val of Object.values(t)) {
    if (val instanceof Date) return val.toISOString();
    if (typeof val === 'string' && /^\d{4}-(0[1-9]|1[0-2])/.test(val)) return val;
  }
  return '';
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return 'Unknown';
  try {
    // Handle ISO format like "2007-08-01T06:00:00.000Z"
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    // Handle "2007-08" format
    if (/^\d{4}-\d{2}$/.test(dateStr)) {
      const [year, month] = dateStr.split('-');
      const d2 = new Date(parseInt(year), parseInt(month) - 1);
      return d2.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    // Just return the year if nothing else works
    return dateStr.substring(0, 4);
  } catch (e) {
    return dateStr.substring(0, 4);
  }
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
        if (window.google && window.google.maps) {
          initPanorama();
        } else {
          setStatus('error');
        }
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
      if (svStatus !== 'OK' || !data) {
        setStatus('error');
        return;
      }

      const times = data.time || [];
      let images = [];

      if (times.length > 1) {
        const sorted = [...times].sort((a, b) => {
          const dateA = getDateFromTimeEntry(a);
          const dateB = getDateFromTimeEntry(b);
          return dateA.localeCompare(dateB);
        });

        const indices = [];
        if (sorted.length <= 4) {
          sorted.forEach((_, i) => indices.push(i));
        } else {
          indices.push(0);
          indices.push(Math.floor(sorted.length * 0.33));
          indices.push(Math.floor(sorted.length * 0.66));
          indices.push(sorted.length - 1);
        }

        images = indices.map(i => {
          const t = sorted[i];
          const panoId = t.pano;
          const dateStr = getDateFromTimeEntry(t);
          const displayDate = formatDisplayDate(dateStr);
          return {
            panoId,
            date: dateStr,
            displayDate,
            year: dateStr ? parseInt(dateStr.substring(0, 4)) : 'Unknown',
            url: `https://maps.googleapis.com/maps/api/streetview?size=800x500&pano=${panoId}&fov=90&pitch=0&key=${apiKey}`,
          };
        });

        setStatus('historical');
      } else {
        const panoId = data.location.pano;
        const dateStr = data.imageDate || '';
        const year = dateStr ? parseInt(dateStr.substring(0, 4)) : 2024;
        const headings = [0, 90, 180, 270];
        const labels = ['North', 'East', 'South', 'West'];
        images = headings.map((heading, i) => ({
          panoId,
          date: dateStr,
          displayDate: `${year} · ${labels[i]}`,
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
      panoramaInstanceRef.current = new window.google.maps.StreetViewPanorama(
        panoramaRef.current,
        {
          pano: current.panoId,
          pov: { heading: current.heading || 0, pitch: 0 },
          zoom: 1,
          addressControl: false,
          showRoadLabels: false,
          motionTracking: false,
          motionTrackingControl: false,
          fullscreenControl: true,
          enableCloseButton: false,
        }
      );
    } else {
      panoramaInstanceRef.current.setPano(current.panoId);
      panoramaInstanceRef.current.setPov({ heading: current.heading || 0, pitch: 0 });
    }
  }, [selectedIndex, historicalImages]);

  const current = historicalImages[selectedIndex];

  return (
    <div style={{
      backgroundColor: '#ffffff', borderRadius: '16px',
      border: '1px solid #E5E7EB', overflow: 'hidden',
      marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    }}>
      <div style={{ position: 'relative', backgroundColor: '#111827', height: 'clamp(300px, 55vw, 520px)' }}>
        <div ref={panoramaRef} style={{
          width: '100%', height: '100%',
          display: historicalImages.length > 0 ? 'block' : 'none',
        }} />

        {status === 'loading' && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#111827',
          }}>
            <div style={{
              width: '40px', height: '40px',
              border: '4px solid rgba(255,255,255,0.15)',
              borderTop: '4px solid #3B82F6', borderRadius: '50%',
              animation: 'spin 1s linear infinite', marginBottom: '16px',
            }} />
            <p style={{ color: '#9CA3AF', fontSize: '14px' }}>Loading Street View...</p>
          </div>
        )}

        {status === 'error' && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#111827',
          }}>
            <p style={{ color: '#9CA3AF', fontSize: '16px' }}>Unable to load Street View for this location.</p>
          </div>
        )}

        {current && (
          <div style={{
            position: 'absolute', top: '16px', left: '16px',
            backgroundColor: 'rgba(0,0,0,0.75)', color: '#ffffff',
            padding: '6px 14px', borderRadius: '20px',
            fontSize: '14px', fontWeight: '600',
            zIndex: 10, pointerEvents: 'none',
          }}>
            {current.displayDate || current.year}
          </div>
        )}

        {status === 'historical' && (
          <div style={{
            position: 'absolute', top: '16px', right: '60px',
            backgroundColor: 'rgba(34,197,94,0.85)', color: '#ffffff',
            padding: '4px 10px', borderRadius: '12px',
            fontSize: '12px', fontWeight: '600',
            zIndex: 10, pointerEvents: 'none',
          }}>
            ✅ Real historical imagery
          </div>
        )}

        {historicalImages.length > 0 && (
          <div style={{
            position: 'absolute', bottom: '16px', left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0,0,0,0.6)', color: '#ffffff',
            padding: '4px 12px', borderRadius: '12px',
            fontSize: '12px', zIndex: 10, pointerEvents: 'none',
          }}>
            🖱 Drag to look around
          </div>
        )}
      </div>

      {historicalImages.length > 0 && (
        <div style={{
          display: 'flex', padding: '16px', gap: '12px',
          overflowX: 'auto', backgroundColor: '#F9FAFB',
          borderTop: '1px solid #E5E7EB',
        }}>
          {historicalImages.map((img, idx) => (
            <button key={idx} onClick={() => setSelectedIndex(idx)} style={{
              flex: '1', minWidth: '120px', padding: '0',
              border: selectedIndex === idx ? '2px solid #3B82F6' : '2px solid #E5E7EB',
              borderRadius: '10px', overflow: 'hidden',
              cursor: 'pointer', backgroundColor: 'transparent',
              transition: 'all 0.2s ease',
            }}>
              <img src={img.url} alt={img.displayDate} style={{
                width: '100%', height: '80px', objectFit: 'cover',
                display: 'block', opacity: selectedIndex === idx ? 1 : 0.65,
              }} />
              <div style={{
                padding: '6px',
                backgroundColor: selectedIndex === idx ? '#3B82F6' : '#ffffff',
                color: selectedIndex === idx ? '#ffffff' : '#374151',
                fontSize: '13px', fontWeight: '600', textAlign: 'center',
              }}>
                {img.displayDate || img.year}
              </div>
            </button>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
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
        minHeight: '100vh', backgroundColor: '#0A0F1E',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{
          width: '48px', height: '48px',
          border: '4px solid rgba(59,130,246,0.2)',
          borderTop: '4px solid #3B82F6', borderRadius: '50%',
          animation: 'spin 1s linear infinite', marginBottom: '24px',
        }} />
        <p style={{ color: '#9CA3AF', fontSize: '18px', marginBottom: '8px' }}>Fetching Street View history...</p>
        <p style={{ color: '#4B5563', fontSize: '14px' }}>{address}</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: '#0A0F1E',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', fontFamily: 'Inter, sans-serif',
        padding: '24px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
        <h2 style={{ color: '#ffffff', fontSize: '24px', marginBottom: '12px' }}>No imagery found</h2>
        <p style={{ color: '#9CA3AF', fontSize: '16px', maxWidth: '480px', marginBottom: '32px' }}>{error}</p>
        <a href="/" style={{
          padding: '12px 24px', backgroundColor: '#3B82F6', color: '#ffffff',
          borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '15px',
        }}>← Try another address</a>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', fontFamily: 'Inter, sans-serif' }}>

      <Script
        id="google-maps-script"
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`}
        onLoad={() => setMapsReady(true)}
      />

      {/* Header */}
      <div style={{
        backgroundColor: '#0A0F1E', padding: '16px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{
            width: '32px', height: '32px', backgroundColor: '#3B82F6',
            borderRadius: '8px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '16px',
          }}>⏱</div>
          <span style={{ color: '#ffffff', fontSize: '18px', fontWeight: '700' }}>TimeBlock</span>
        </a>
        <a href="/" style={{ color: '#6B7280', fontSize: '14px', textDecoration: 'none' }}>← New search</a>
      </div>

      {/* Address Bar */}
      <div style={{
        backgroundColor: '#0A0F1E', padding: '0 32px 32px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <h1 style={{ color: '#ffffff', fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: '700', marginBottom: '8px' }}>
          {data?.address}
        </h1>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

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
            backgroundColor: '#ffffff', borderRadius: '16px',
            border: '1px solid #E5E7EB', overflow: 'hidden',
            marginBottom: '32px', height: '400px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '40px', height: '40px',
                border: '4px solid rgba(59,130,246,0.2)',
                borderTop: '4px solid #3B82F6', borderRadius: '50%',
                animation: 'spin 1s linear infinite', margin: '0 auto 16px',
              }} />
              <p style={{ color: '#6B7280', fontSize: '14px' }}>Loading maps...</p>
            </div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!analysis && !analyzing && images.length > 0 && (
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '16px',
            border: '1px solid #E5E7EB', padding: '40px',
            textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            marginBottom: '32px',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🤖</div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0A0F1E', marginBottom: '8px' }}>
              Ready to analyze this neighborhood
            </h2>
            <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '24px' }}>
              Claude AI will review all {images.length} Street View images and generate a full CRE report.
            </p>
            <button onClick={runAnalysis} style={{
              padding: '14px 32px', backgroundColor: '#3B82F6', color: '#ffffff',
              border: 'none', borderRadius: '10px', cursor: 'pointer',
              fontSize: '16px', fontWeight: '600', fontFamily: 'Inter, sans-serif',
            }}>
              Run AI Analysis →
            </button>
          </div>
        )}

        {analyzing && (
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '16px',
            border: '1px solid #E5E7EB', padding: '48px',
            textAlign: 'center', marginBottom: '32px',
          }}>
            <div style={{
              width: '40px', height: '40px',
              border: '4px solid rgba(59,130,246,0.2)',
              borderTop: '4px solid #3B82F6', borderRadius: '50%',
              animation: 'spin 1s linear infinite', margin: '0 auto 16px',
            }} />
            <p style={{ color: '#374151', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
              Analyzing neighborhood changes...
            </p>
            <p style={{ color: '#9CA3AF', fontSize: '14px' }}>
              Claude AI is reviewing all {images.length} images. This takes about 20 seconds.
            </p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {analysisError && (
          <div style={{
            backgroundColor: '#FEF2F2', borderRadius: '16px',
            border: '1px solid #FECACA', padding: '24px',
            marginBottom: '32px', textAlign: 'center',
          }}>
            <p style={{ color: '#DC2626', fontSize: '15px', marginBottom: '12px' }}>{analysisError}</p>
            <button onClick={runAnalysis} style={{
              padding: '10px 20px', backgroundColor: '#3B82F6', color: '#ffffff',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '14px', fontWeight: '600',
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
    <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#0A0F1E' }} />}>
      <ResultsContent />
    </Suspense>
  );
}