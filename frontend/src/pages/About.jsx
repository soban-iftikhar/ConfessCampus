const categoryMeta = {
  confession: { label: 'Confession', emoji: '', bg: 'var(--confession-bg)', text: 'var(--confession-text)', border: 'var(--confession-border)' },
  discussion: { label: 'Discussion', emoji: '', bg: 'var(--discussion-bg)', text: 'var(--discussion-text)', border: 'var(--discussion-border)' },
  'lost-found': { label: 'Lost & Found', emoji: '', bg: 'var(--lost-found-bg)', text: 'var(--lost-found-text)', border: 'var(--lost-found-border)' },
  carpool: { label: 'Carpool', emoji: '', bg: 'var(--carpool-bg)', text: 'var(--carpool-text)', border: 'var(--carpool-border)' },
};






import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const FeatureCard = ({ title, desc }) => (
  <div style={{
    padding: '24px', background: 'var(--white)', borderRadius: 'var(--radius-xl)',
    border: `1px solid ${'var(--border)'}`, boxShadow: 'var(--shadow-sm)',
    transition: 'var(--transition-normal)',
  }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'none'; }}
  >
    <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text)', marginBottom: '8px' }}>{title}</h3>
    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{desc}</p>
  </div>
);

const StatItem = ({ value, label }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-3xl)', color: 'var(--white)' }}>{value}</div>
    <div style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>{label}</div>
  </div>
);

const About = () => {
  const navigate = useNavigate();

  const features = [
    { emoji: '', title: 'Anonymous Confessions', desc: 'Share your campus secrets, feelings, and thoughts with complete anonymity. Your identity is never revealed.' },
    { emoji: '', title: 'Open Discussions', desc: 'Ask questions, spark debates, and get answers from your fellow students. Mark threads as resolved when answered.' },
    { emoji: '', title: 'Lost & Found', desc: 'Lost your keys? Found a wallet? Our community-driven lost & found helps reunite items with their owners fast.' },
    { emoji: '', title: 'Campus Carpools', desc: 'Split costs and reduce your carbon footprint by sharing rides with fellow students going the same way.' },
    { emoji: '', title: 'Privacy First', desc: 'Every anonymous post is completely de-identified. We never store identifying information alongside anonymous content.' },
    { emoji: '', title: 'Works Everywhere', desc: 'Fully responsive on desktop, tablet, and mobile. Use it on any device, anywhere on campus.' },
  ];

  const values = [
    { title: 'Inclusive Community', desc: 'Everyone belongs here, regardless of major, year, or background.' },
    { title: 'Safe Space', desc: 'We actively moderate and protect against harassment and harmful content.' },
    { title: 'Student-First', desc: 'Built specifically for the unique needs of university life.' },
  ];

  return (
    <Layout>
      {/* Hero */}
      <div style={{
        background: 'var(--primary)',
        padding: '80px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '300px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{ position: 'relative', maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}></div>
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-4xl)',
            color: 'var(--white)', marginBottom: '16px', letterSpacing: '-1px',
            lineHeight: 1.15,
          }}>
            Your Campus,<br />Unfiltered
          </h1>
          <p style={{
            fontSize: 'var(--text-lg)', color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.7, maxWidth: '540px', margin: '0 auto 28px',
          }}>
            WhisperCampus is the anonymous community platform built exclusively for university students to share, connect, and support each other.
          </p>
          <button
            onClick={() => navigate('/signup')}
            style={{
              padding: '14px 32px', background: 'var(--white)', color: 'var(--primary)',
              borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-base)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)', transition: 'var(--transition-fast)',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            Join for Free
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        background: '#4338CA',
        padding: '32px 24px',
      }}>
        <div style={{
          maxWidth: '860px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '24px',
        }}>
          <StatItem value="10K+" label="Students" />
          <StatItem value="50K+" label="Posts Shared" />
          <StatItem value="200K+" label="Likes Given" />
          <StatItem value="100%" label="Anonymous" />
        </div>
      </div>

      {/* Mission */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '64px 24px 48px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', marginBottom: '48px' }}>
          <span style={{
            padding: '6px 16px', borderRadius: 'var(--radius-full)',
            background: 'var(--primary-light)', color: 'var(--primary)',
            fontSize: 'var(--text-xs)', fontWeight: 700,
            display: 'inline-block', marginBottom: '16px',
          }}>
            OUR MISSION
          </span>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-2xl)',
            color: 'var(--text)', marginBottom: '16px', letterSpacing: '-0.5px',
          }}>
            Breaking down campus barriers
          </h2>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
            University life is full of questions you're afraid to ask, feelings you can't share, and connections you haven't made yet. WhisperCampus creates a judgment-free space where every student can be heard.
          </p>
        </div>

        {/* Features grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px', marginBottom: '64px',
        }}>
          {features.map(f => <FeatureCard key={f.title} {...f} />)}
        </div>

        {/* Categories */}
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-2xl)',
          border: `1px solid ${'var(--border)'}`, padding: '40px', marginBottom: '64px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-xl)',
            color: 'var(--text)', marginBottom: '8px', textAlign: 'center',
          }}>4 Types of Posts</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: '28px' }}>
            Everything your campus needs, in one place
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '18px 20px',
            maxWidth: '760px',
            margin: '0 auto',
          }}>
            {Object.entries(categoryMeta).map(([key, meta]) => (
              <div key={key} style={{
                padding: '20px', borderRadius: 'var(--radius-xl)', background: meta.bg,
                border: `1.5px solid ${meta.border}`, textAlign: 'center',
              }}>

                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: meta.text, fontSize: 'var(--text-base)' }}>{meta.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <h2 style={{
          fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-xl)',
          color: 'var(--text)', textAlign: 'center', marginBottom: '24px',
        }}>Our Values</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '64px' }}>
          {values.map(v => (
            <div key={v.title} style={{
              padding: '28px', textAlign: 'center', background: 'var(--white)',
              borderRadius: 'var(--radius-xl)', border: `1px solid ${'var(--border)'}`, boxShadow: 'var(--shadow-sm)',
            }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text)', marginBottom: '8px' }}>{v.title}</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{v.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          background: 'var(--primary)',
          borderRadius: 'var(--radius-2xl)', padding: '48px', textAlign: 'center',
        }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-2xl)', color: 'var(--white)', marginBottom: '12px' }}>
            Ready to join your campus community?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'var(--text-base)', marginBottom: '28px' }}>
            It's free, anonymous, and takes 30 seconds to join.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/signup')} style={{
              padding: '13px 28px', background: 'var(--white)', color: 'var(--primary)',
              borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-base)',
            }}>Create Account</button>
            <button onClick={() => navigate('/feed')} style={{
              padding: '13px 28px', background: 'transparent',
              color: 'var(--white)', borderRadius: 'var(--radius-full)',
              border: '2px solid rgba(255,255,255,0.5)',
              cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-base)',
            }}>Browse Feed</button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
