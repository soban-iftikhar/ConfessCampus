import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Logo = () => (
  <div
    onClick={() => window.location.href = '/feed'}
    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
  >
    <span style={{
      fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-lg)',
      color: 'var(--text)', letterSpacing: '-0.5px',
    }}>
      Whisper<span style={{ color: 'var(--primary)' }}>Campus</span>
    </span>
  </div>
);

const SearchBar = ({ onSearch }) => {
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '420px' }}>
      <div style={{ position: 'relative' }}>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search posts, confessions, rides..."
          style={{
            width: '100%', padding: '10px 16px 10px 38px',
            background: 'var(--bg-muted)', border: `1.5px solid transparent`,
            borderRadius: 'var(--radius-full)', fontSize: 'var(--text-sm)',
            color: 'var(--text)', outline: 'none', transition: 'var(--transition-fast)',
            fontFamily: 'var(--font-body)',
          }}
          onFocus={e => {
            e.target.style.border = `1.5px solid ${'var(--primary)'}`;
            e.target.style.background = 'var(--white)';
            e.target.style.boxShadow = `0 0 0 3px ${'var(--primary-light)'}`;
          }}
          onBlur={e => {
            e.target.style.border = '1.5px solid transparent';
            e.target.style.background = 'var(--bg-muted)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>
    </form>
  );
};

const NavLink = ({ to, label, active }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '8px 14px', borderRadius: 'var(--radius-full)',
        background: active ? 'var(--primary-light)' : 'transparent',
        color: active ? 'var(--primary)' : 'var(--text-secondary)',
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 500,
        transition: 'var(--transition-fast)', cursor: 'pointer', border: 'none',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-muted)'; e.currentTarget.style.color = 'var(--text)'; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
    >
      <span className="hide-mobile">{label}</span>
    </button>
  );
};

const UserMenu = ({ user, logout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '38px', height: '38px', borderRadius: 'var(--radius-full)',
          background: 'var(--primary)',
          color: 'var(--white)', fontFamily: 'var(--font-heading)', fontWeight: 700,
          fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', border: `2px solid ${'var(--primary-light)'}`,
          cursor: 'pointer', transition: 'var(--transition-fast)',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {initials}
      </button>

      {open && (
        <div className="slide-down" style={{
          position: 'absolute', right: 0, top: 'calc(100% + 10px)',
          background: 'var(--white)', borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)', border: `1px solid ${'var(--border)'}`,
          minWidth: '200px', overflow: 'hidden', zIndex: 1000,
        }}>
          <div style={{ padding: '16px', borderBottom: `1px solid ${'var(--border-light)'}` }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text)' }}>{user?.name}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>@{user?.username}</div>
          </div>
          {[
            { label: 'My Profile', action: () => { navigate(`/profile/${user?._id}`); setOpen(false); } },
            { label: 'Messages', action: () => { navigate('/messages'); setOpen(false); } },
            { label: 'Settings', action: () => { navigate('/settings'); setOpen(false); } },
          ].map(item => (
            <button
              key={item.label}
              onClick={item.action}
              style={{
                width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center',
                gap: '10px', background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--text)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)',
                textAlign: 'left', transition: 'var(--transition-fast)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {item.label}
            </button>
          ))}
          <div style={{ borderTop: `1px solid ${'var(--border-light)'}` }}>
            <button
              onClick={() => { logout(); navigate('/login'); setOpen(false); }}
              style={{
                width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center',
                gap: '10px', background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--rose)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)', textAlign: 'left',
                transition: 'var(--transition-fast)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--rose-light)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span></span> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const MobileMenu = ({ open, onClose, user, logout }) => {
  const navigate = useNavigate();
  const links = [
    { to: '/feed', label: 'Feed' },
    { to: '/messages', label: 'Messages' },
    { to: '/search', label: 'Search' },
    { to: '/create', label: 'Create Post' },
    { to: `/profile/${user?._id}`, label: 'My Profile' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
    }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'var(--overlay)', backdropFilter: 'blur(4px)',
      }} />
      <div className="slide-in-right" style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: '280px',
        background: 'var(--white)', boxShadow: 'var(--shadow-xl)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{
          padding: '20px', borderBottom: `1px solid ${'var(--border-light)'}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Logo />
          <button onClick={onClose} style={{
            width: '32px', height: '32px', borderRadius: 'var(--radius-full)',
            background: 'var(--bg-muted)', border: 'none', cursor: 'pointer',
            fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {user && (
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${'var(--border-light)'}`, background: 'var(--bg-muted)' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text)' }}>{user.name}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>@{user.username}</div>
          </div>
        )}

        <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
          {links.map(link => (
            <button
              key={link.to}
              onClick={() => { navigate(link.to); onClose(); }}
              style={{
                width: '100%', padding: '13px 16px', display: 'flex', alignItems: 'center',
                gap: '12px', background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--text)', fontSize: 'var(--text-base)', fontFamily: 'var(--font-body)',
                borderRadius: 'var(--radius-md)', transition: 'var(--transition-fast)', textAlign: 'left',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '18px' }}>{link.icon}</span>
              <span>{link.label}</span>
            </button>
          ))}
        </nav>

        {user && (
          <div style={{ padding: '12px', borderTop: `1px solid ${'var(--border-light)'}` }}>
            <button
              onClick={() => { logout(); navigate('/login'); onClose(); }}
              style={{
                width: '100%', padding: '13px 16px', display: 'flex', alignItems: 'center',
                gap: '12px', background: 'var(--rose-light)', border: 'none', cursor: 'pointer',
                color: 'var(--rose)', fontSize: 'var(--text-base)', fontFamily: 'var(--font-body)',
                borderRadius: 'var(--radius-md)', fontWeight: 600,
              }}
            >
              <span></span> Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.92)' : 'var(--white)',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'var(--border-light)'}`,
        boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
        transition: 'var(--transition-normal)',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          padding: '0 24px', height: '64px',
          display: 'flex', alignItems: 'center', gap: '20px',
        }}>
          <Logo />

          <div className="hide-mobile" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <SearchBar />
          </div>

          <nav className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <NavLink to="/feed" label="Feed" active={isActive('/feed')} />
            <NavLink to="/messages" label="DMs" active={isActive('/messages')} />
            <NavLink to="/about" label="About" active={isActive('/about')} />
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {user ? (
              <>
                <button
                  onClick={() => navigate('/create')}
                  className="hide-mobile"
                  style={{
                    padding: '9px 18px', background: 'var(--primary)', color: 'var(--white)',
                    borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-body)', fontWeight: 600,
                    fontSize: 'var(--text-sm)', cursor: 'pointer', border: 'none',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    boxShadow: `0 4px 12px ${'var(--primary)'}40`, transition: 'var(--transition-fast)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-hover)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  ✏️ Post
                </button>
                <UserMenu user={user} logout={logout} />
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '9px 20px', background: 'var(--primary)', color: 'var(--white)',
                  borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-body)', fontWeight: 600,
                  fontSize: 'var(--text-sm)', cursor: 'pointer', border: 'none',
                  boxShadow: `0 4px 12px ${'var(--primary)'}40`,
                }}
              >
                Sign In
              </button>
            )}

            {/* Hamburger */}
            <button
              className="hide-desktop"
              onClick={() => setMobileOpen(true)}
              style={{
                width: '38px', height: '38px', background: 'var(--bg-muted)',
                border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: '5px',
              }}
            >
              <span style={{ display: 'block', width: '18px', height: '2px', background: 'var(--text)', borderRadius: '2px' }} />
              <span style={{ display: 'block', width: '14px', height: '2px', background: 'var(--text)', borderRadius: '2px' }} />
              <span style={{ display: 'block', width: '18px', height: '2px', background: 'var(--text)', borderRadius: '2px' }} />
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="hide-desktop" style={{ padding: '8px 16px 12px', borderTop: `1px solid ${'var(--border-light)'}` }}>
          <SearchBar />
        </div>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        user={user}
        logout={logout}
      />
    </>
  );
};

export default Navbar;
