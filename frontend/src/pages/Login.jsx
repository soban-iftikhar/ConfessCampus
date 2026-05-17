import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { UserRound, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/services';
import { validateLogin } from '../utils/validation';
import { Input, Button } from '../components/FormComponents';
import { useToast } from '../components/Toast';

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const from = location.state?.from?.pathname || '/feed';

  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateLogin(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const data = await authAPI.login({ username: form.username.trim(), password: form.password });
      login(data.user, data.accessToken, data.refreshToken);
      toast.success(`Welcome back, ${data.user.name}`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Invalid credentials');
      setErrors({ general: err.message || 'Invalid username or password' });
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: '-120px', right: '-120px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: `radial-gradient(circle, ${'var(--primary-light)'} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-100px', left: '-100px',
        width: '320px', height: '320px', borderRadius: '50%',
        background: `radial-gradient(circle, ${'var(--rose-light)'} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div className="fade-in-scale" style={{
        background: 'var(--white)', borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-xl)', width: '100%', maxWidth: '440px',
        padding: '40px', position: 'relative', zIndex: 1,
        border: `1px solid ${'var(--border-light)'}`,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: 'var(--radius-xl)',
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', margin: '0 auto 16px',
            boxShadow: `0 8px 24px ${'var(--primary)'}40`,
          }}>W</div>
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-2xl)',
            color: 'var(--text)', marginBottom: '6px', letterSpacing: '-0.5px',
          }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Sign in to your WhisperCampus account
          </p>
        </div>

        {/* Google OAuth */}
        <button
          onClick={() => authAPI.googleLogin()}
          style={{
            width: '100%', padding: '12px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '10px',
            background: 'var(--white)', border: `1.5px solid ${'var(--border)'}`,
            borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'var(--font-body)',
            fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--text)',
            marginBottom: '20px', transition: 'var(--transition-fast)',
            boxShadow: 'var(--shadow-sm)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-light)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--white)'; }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {errors.general && (
            <div style={{
              padding: '12px 14px', background: 'var(--error-light)', borderRadius: 'var(--radius-md)',
              border: `1px solid #FECACA`, color: 'var(--error)', fontSize: 'var(--text-sm)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              ! {errors.general}
            </div>
          )}

          <Input
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="johndoe"
            icon={<UserRound size={16} />}
            error={errors.username}
            required
            autoComplete="username"
          />

          <div style={{ position: 'relative' }}>
            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              icon={<KeyRound size={16} />}
              error={errors.password}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: '14px', top: '37px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '16px', color: 'var(--text-muted)',
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Button type="submit" fullWidth loading={loading} size="lg">
            Sign In
          </Button>
        </form>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '24px' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{
            color: 'var(--primary)', fontWeight: 600, textDecoration: 'none',
          }}>Sign up free</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
