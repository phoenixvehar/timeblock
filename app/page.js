'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const EXAMPLE_ADDRESSES = [
  {
    label: 'Hudson Yards, New York',
    address: '30 Hudson Yards, New York, NY',
    description: 'Empty rail yards → massive development',
  },
  {
    label: 'The Wharf, Washington DC',
    address: '800 Wharf St SW, Washington, DC',
    description: 'Industrial waterfront → luxury destination',
  },
  {
    label: 'Midtown Detroit',
    address: '4201 Woodward Ave, Detroit, MI',
    description: 'Abandoned blocks → urban revival',
  },
];

export default function Home() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = (searchAddress) => {
    const target = searchAddress || address;
    if (!target.trim()) return;
    setLoading(true);
    router.push(`/results?address=${encodeURIComponent(target.trim())}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <main style={{ minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* HERO SECTION */}
      <section style={{
        backgroundColor: '#0A0F1E',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Background glow effect */}
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo / Brand */}
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#3B82F6',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}>⏱</div>
          <span style={{ color: '#ffffff', fontSize: '22px', fontWeight: '700', letterSpacing: '-0.5px' }}>
            TimeBlock
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          color: '#ffffff',
          fontSize: 'clamp(32px, 5vw, 64px)',
          fontWeight: '800',
          textAlign: 'center',
          lineHeight: '1.1',
          marginBottom: '16px',
          letterSpacing: '-1px',
          maxWidth: '800px',
        }}>
          See how any neighborhood<br />
          <span style={{ color: '#3B82F6' }}>has changed over time</span>
        </h1>

        {/* Subheadline */}
        <p style={{
          color: '#9CA3AF',
          fontSize: 'clamp(16px, 2vw, 20px)',
          textAlign: 'center',
          marginBottom: '48px',
          maxWidth: '520px',
          lineHeight: '1.6',
        }}>
          Type any address. Get a visual timeline of Street View history and an AI-powered neighborhood analysis.
        </p>

        {/* Search Bar */}
        <div style={{
          width: '100%',
          maxWidth: '620px',
          display: 'flex',
          gap: '12px',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter any address, e.g. 123 Main St, Chicago, IL"
            style={{
              flex: '1',
              minWidth: '280px',
              padding: '16px 20px',
              fontSize: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              backgroundColor: 'rgba(255,255,255,0.06)',
              color: '#ffffff',
              outline: 'none',
              fontFamily: 'Inter, sans-serif',
            }}
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading || !address.trim()}
            style={{
              padding: '16px 28px',
              fontSize: '16px',
              fontWeight: '600',
              backgroundColor: loading ? '#1D4ED8' : '#3B82F6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif',
              whiteSpace: 'nowrap',
              opacity: !address.trim() ? 0.5 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? 'Loading...' : 'Analyze →'}
          </button>
        </div>

        {/* Example Addresses */}
        <div style={{ marginTop: '48px', textAlign: 'center' }}>
          <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Try a demo address
          </p>
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            {EXAMPLE_ADDRESSES.map((example) => (
              <button
                key={example.address}
                onClick={() => handleSearch(example.address)}
                style={{
                  padding: '10px 18px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#D1D5DB',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.15)';
                  e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '2px' }}>{example.label}</div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>{example.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#374151',
          fontSize: '13px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span>scroll to learn more</span>
          <span>↓</span>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section style={{
        backgroundColor: '#ffffff',
        padding: '100px 24px',
        textAlign: 'center',
      }}>
        <p style={{ color: '#3B82F6', fontWeight: '600', fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
          How it works
        </p>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: '800', color: '#0A0F1E', marginBottom: '16px', letterSpacing: '-0.5px' }}>
          Neighborhood intelligence in seconds
        </h2>
        <p style={{ color: '#6B7280', fontSize: '18px', maxWidth: '520px', margin: '0 auto 64px', lineHeight: '1.6' }}>
          We pull real historical Street View imagery and run it through AI trained on commercial real estate analysis.
        </p>

        <div style={{
          display: 'flex',
          gap: '32px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          maxWidth: '1000px',
          margin: '0 auto',
        }}>
          {[
            { step: '01', icon: '📍', title: 'Enter any address', desc: 'Type a US address and our system finds every Street View capture available for that location.' },
            { step: '02', icon: '🕐', title: 'Visual time machine', desc: 'See 4 images spanning years of history — from as far back as 2007 up to today.' },
            { step: '03', icon: '🤖', title: 'AI neighborhood analysis', desc: 'Claude AI analyzes every image and writes a detailed CRE report covering development, retail, and trajectory.' },
            { step: '04', icon: '📄', title: 'Export your report', desc: 'Download a professional PDF with all images, analysis, and a Neighborhood Change Score.' },
          ].map((item) => (
            <div key={item.step} style={{
              flex: '1',
              minWidth: '220px',
              maxWidth: '240px',
              padding: '32px 24px',
              backgroundColor: '#F9FAFB',
              borderRadius: '16px',
              border: '1px solid #E5E7EB',
              textAlign: 'left',
            }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>{item.icon}</div>
              <div style={{ color: '#3B82F6', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', marginBottom: '8px' }}>
                STEP {item.step}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0A0F1E', marginBottom: '8px' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        backgroundColor: '#0A0F1E',
        padding: '40px 24px',
        textAlign: 'center',
        color: '#374151',
        fontSize: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{
            width: '24px',
            height: '24px',
            backgroundColor: '#3B82F6',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
          }}>⏱</div>
          <span style={{ color: '#6B7280', fontWeight: '600' }}>TimeBlock</span>
        </div>
        <p>Powered by Google Street View & Claude AI</p>
      </footer>

    </main>
  );
}