'use client';

import { useState } from 'react';

const EXAMPLES = [
  {
    label: 'Hudson Yards',
    sublabel: 'New York, NY',
    address: '30 Hudson Yards, New York, NY',
    tag: 'Dramatic transformation',
    tagColor: '#22C55E',
  },
  {
    label: 'The Wharf',
    sublabel: 'Washington, DC',
    address: '800 Wharf St SW, Washington, DC',
    tag: 'Industrial → luxury',
    tagColor: '#3B82F6',
  },
  {
    label: 'Midtown Detroit',
    sublabel: 'Detroit, MI',
    address: '4201 Woodward Ave, Detroit, MI',
    tag: 'Urban revival',
    tagColor: '#F59E0B',
  },
];

export default function Home() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = (searchAddress) => {
    const target = searchAddress || address;
    if (!target.trim()) return;
    setLoading(true);
    window.location.href = `/results?address=${encodeURIComponent(target.trim())}`;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh' }}>

      {/* HERO */}
      <section style={{
        background: 'linear-gradient(160deg, #060B18 0%, #0A1020 50%, #0D1428 100%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Grid background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }} />

        {/* Glow orb */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* Nav */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          padding: '20px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px',
              background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              borderRadius: '9px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px',
              boxShadow: '0 0 20px rgba(59,130,246,0.3)',
            }}>⏱</div>
            <span style={{
              color: '#fff',
              fontSize: '17px',
              fontWeight: '600',
              letterSpacing: '-0.3px',
            }}>TimeBlock</span>
          </div>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.25)',
            fontFamily: "'DM Mono', monospace",
            letterSpacing: '1px',
          }}>
            NEIGHBORHOOD INTELLIGENCE
          </div>
        </div>

        {/* Hero content */}
        <div style={{
          textAlign: 'center',
          maxWidth: '780px',
          position: 'relative',
          zIndex: 1,
          animation: 'fadeUp 0.8s ease both',
        }}>

          {/* Tag */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: '20px',
            padding: '6px 14px',
            marginBottom: '32px',
          }}>
            <div style={{
              width: '6px', height: '6px',
              backgroundColor: '#3B82F6',
              borderRadius: '50%',
              animation: 'pulse 2s ease infinite',
            }} />
            <span style={{
              color: '#60A5FA',
              fontSize: '12px',
              fontWeight: '500',
              letterSpacing: '0.5px',
              fontFamily: "'DM Mono', monospace",
            }}>
              POWERED BY GOOGLE STREET VIEW + CLAUDE AI
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(40px, 6vw, 76px)',
            fontWeight: '700',
            color: '#ffffff',
            lineHeight: '1.05',
            letterSpacing: '-2px',
            marginBottom: '20px',
          }}>
            See how any block<br />
            <span style={{
              background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #818CF8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              changed over time
            </span>
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: 'clamp(16px, 2vw, 19px)',
            lineHeight: '1.65',
            marginBottom: '48px',
            maxWidth: '520px',
            margin: '0 auto 48px',
          }}>
            Enter any address. Get a visual timeline of Street View history and an AI-powered commercial real estate analysis.
          </p>

          {/* Search */}
          <div style={{
            display: 'flex',
            gap: '10px',
            maxWidth: '600px',
            margin: '0 auto 48px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="123 Main St, Chicago, IL"
              style={{
                flex: '1',
                minWidth: '260px',
                padding: '16px 20px',
                fontSize: '15px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.08)',
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: '#ffffff',
                outline: 'none',
                fontFamily: "'DM Sans', sans-serif",
                backdropFilter: 'blur(10px)',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading || !address.trim()}
              style={{
                padding: '16px 28px',
                fontSize: '15px',
                fontWeight: '600',
                background: loading ? 'rgba(59,130,246,0.5)' : 'linear-gradient(135deg, #3B82F6, #2563EB)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'wait' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                whiteSpace: 'nowrap',
                opacity: !address.trim() ? 0.4 : 1,
                transition: 'all 0.2s ease',
                boxShadow: address.trim() ? '0 0 24px rgba(59,130,246,0.3)' : 'none',
              }}
            >
              {loading ? 'Loading...' : 'Analyze →'}
            </button>
          </div>

          {/* Examples */}
          <div>
            <p style={{
              color: 'rgba(255,255,255,0.2)',
              fontSize: '11px',
              letterSpacing: '1.5px',
              fontFamily: "'DM Mono', monospace",
              marginBottom: '14px',
            }}>
              TRY A DEMO
            </p>
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              {EXAMPLES.map(ex => (
                <button
                  key={ex.address}
                  onClick={() => handleSearch(ex.address)}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff', marginBottom: '3px' }}>
                    {ex.label}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                    {ex.sublabel}
                  </div>
                  <div style={{
                    marginTop: '6px',
                    fontSize: '10px',
                    color: ex.tagColor,
                    fontFamily: "'DM Mono', monospace",
                    letterSpacing: '0.5px',
                  }}>
                    {ex.tag}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{
          position: 'absolute',
          bottom: '28px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.15)',
          fontSize: '12px',
          fontFamily: "'DM Mono', monospace",
          letterSpacing: '1px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
        }}>
          SCROLL ↓
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{
        backgroundColor: '#F8FAFC',
        padding: '100px 24px',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{
              color: '#3B82F6',
              fontSize: '11px',
              fontWeight: '600',
              letterSpacing: '2px',
              fontFamily: "'DM Mono', monospace",
              marginBottom: '12px',
            }}>
              HOW IT WORKS
            </p>
            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: '700',
              color: '#0F172A',
              letterSpacing: '-1px',
              lineHeight: '1.1',
            }}>
              Neighborhood intelligence<br />in under a minute
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px',
          }}>
            {[
              { num: '01', icon: '📍', title: 'Enter any address', desc: 'Type any US address. Our system finds every Street View capture available.' },
              { num: '02', icon: '🕐', title: 'Visual time machine', desc: 'See images spanning years of history — from as far back as 2007 to today.' },
              { num: '03', icon: '🤖', title: 'AI CRE analysis', desc: 'Claude AI analyzes every image and writes a detailed neighborhood report.' },
              { num: '04', icon: '📄', title: 'Export your report', desc: 'Download a professional PDF with images, analysis, and a Change Score.' },
            ].map(item => (
              <div key={item.num} style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '28px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '16px' }}>{item.icon}</div>
                <div style={{
                  fontSize: '11px',
                  color: '#3B82F6',
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: '1px',
                  marginBottom: '8px',
                }}>STEP {item.num}</div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#0F172A',
                  marginBottom: '8px',
                  letterSpacing: '-0.3px',
                }}>{item.title}</h3>
                <p style={{
                  fontSize: '14px',
                  color: '#64748B',
                  lineHeight: '1.6',
                }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        background: 'linear-gradient(160deg, #060B18 0%, #0A1020 100%)',
        padding: '40px 24px',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{
            width: '26px', height: '26px',
            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            borderRadius: '7px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px',
          }}>⏱</div>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', fontWeight: '500' }}>TimeBlock</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', fontFamily: "'DM Mono', monospace" }}>
          Powered by Google Street View & Claude AI
        </p>
      </footer>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </main>
  );
}