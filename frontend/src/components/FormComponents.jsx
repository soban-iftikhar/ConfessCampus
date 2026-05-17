import { useState } from 'react';
import { Loader2 } from 'lucide-react';

// ─── Input ──────────────────────────────────────────────────────────
export const Input = ({
  label, name, type = 'text', value, onChange, onBlur,
  placeholder, error, hint, required, disabled, icon, maxLength,
  autoComplete, style: extraStyle,
}) => {
  const [focused, setFocused] = useState(false);

  const borderColor = error ? 'var(--error)' : focused ? 'var(--primary)' : 'var(--border)';
  const bgColor = disabled ? 'var(--bg-muted)' : 'var(--white)';
  const shadowVal = focused && !error ? `0 0 0 3px ${'var(--primary-light)'}` : error ? `0 0 0 3px ${'var(--error-light)'}` : 'none';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...extraStyle }}>
      {label && (
        <label style={{
          fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)',
          fontFamily: 'var(--font-body)', display: 'flex', gap: '4px', alignItems: 'center',
        }}>
          {label}
          {required && <span style={{ color: 'var(--rose)' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
            fontSize: '16px', pointerEvents: 'none', zIndex: 1,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>{icon}</span>
        )}
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          maxLength={maxLength}
          style={{
            width: '100%',
            padding: icon ? '12px 14px 12px 42px' : '12px 14px',
            border: `1.5px solid ${borderColor}`,
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-base)',
            color: 'var(--text)',
            background: bgColor,
            outline: 'none',
            boxShadow: shadowVal,
            transition: 'var(--transition-fast)',
            fontFamily: 'var(--font-body)',
            opacity: disabled ? 0.6 : 1,
            cursor: disabled ? 'not-allowed' : 'text',
          }}
        />
        {maxLength && (
          <span style={{
            position: 'absolute', right: '12px', bottom: '12px',
            fontSize: 'var(--text-xs)', color: value?.length >= maxLength ? 'var(--error)' : 'var(--text-muted)',
          }}>
            {value?.length ?? 0}/{maxLength}
          </span>
        )}
      </div>
      {error && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          ⚠️ {error}
        </p>
      )}
      {hint && !error && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{hint}</p>
      )}
    </div>
  );
};

// ─── Textarea ────────────────────────────────────────────────────────
export const Textarea = ({
  label, name, value, onChange, onBlur,
  placeholder, error, hint, required, disabled, maxLength, rows = 4,
  style: extraStyle,
}) => {
  const [focused, setFocused] = useState(false);

  const borderColor = error ? 'var(--error)' : focused ? 'var(--primary)' : 'var(--border)';
  const shadowVal = focused && !error ? `0 0 0 3px ${'var(--primary-light)'}` : error ? `0 0 0 3px ${'var(--error-light)'}` : 'none';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...extraStyle }}>
      {label && (
        <label style={{
          fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)',
          fontFamily: 'var(--font-body)', display: 'flex', gap: '4px', alignItems: 'center',
        }}>
          {label}
          {required && <span style={{ color: 'var(--rose)' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          rows={rows}
          style={{
            width: '100%', padding: '12px 14px',
            border: `1.5px solid ${borderColor}`,
            borderRadius: 'var(--radius-md)', fontSize: 'var(--text-base)',
            color: 'var(--text)', background: disabled ? 'var(--bg-muted)' : 'var(--white)',
            outline: 'none', boxShadow: shadowVal, transition: 'var(--transition-fast)',
            fontFamily: 'var(--font-body)', resize: 'vertical', lineHeight: 1.6,
            opacity: disabled ? 0.6 : 1,
          }}
        />
        {maxLength && (
          <span style={{
            position: 'absolute', right: '12px', bottom: '12px',
            fontSize: 'var(--text-xs)', color: value?.length >= maxLength ? 'var(--error)' : 'var(--text-muted)',
            background: 'var(--white)', padding: '0 4px',
          }}>
            {value?.length ?? 0}/{maxLength}
          </span>
        )}
      </div>
      {error && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          ! {error}
        </p>
      )}
      {hint && !error && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{hint}</p>
      )}
    </div>
  );
};

// ─── Select ──────────────────────────────────────────────────────────
export const Select = ({
  label, name, value, onChange, options, error, required, disabled, placeholder, style: extraStyle,
}) => {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? 'var(--error)' : focused ? 'var(--primary)' : 'var(--border)';
  const shadowVal = focused ? `0 0 0 3px ${'var(--primary-light)'}` : 'none';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...extraStyle }}>
      {label && (
        <label style={{
          fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)',
          fontFamily: 'var(--font-body)', display: 'flex', gap: '4px',
        }}>
          {label}{required && <span style={{ color: 'var(--rose)' }}>*</span>}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        disabled={disabled}
        style={{
          width: '100%', padding: '12px 14px',
          border: `1.5px solid ${borderColor}`,
          borderRadius: 'var(--radius-md)', fontSize: 'var(--text-base)',
          color: value ? 'var(--text)' : 'var(--text-muted)',
          background: 'var(--white)', outline: 'none',
          boxShadow: shadowVal, transition: 'var(--transition-fast)',
          fontFamily: 'var(--font-body)', cursor: 'pointer', appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '18px',
          paddingRight: '40px',
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--error)' }}>! {error}</p>}
    </div>
  );
};

// ─── Button ──────────────────────────────────────────────────────────
export const Button = ({
  children, onClick, type = 'button', variant = 'primary',
  size = 'md', disabled, loading, fullWidth, icon, style: extraStyle,
}) => {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const sizes = {
    sm: { padding: '8px 16px', fontSize: 'var(--text-sm)' },
    md: { padding: '11px 22px', fontSize: 'var(--text-base)' },
    lg: { padding: '14px 28px', fontSize: 'var(--text-md)' },
  };

  const variants = {
    primary: {
      background: hovered ? 'var(--primary-hover)' : 'var(--primary)',
      color: 'var(--white)',
      border: 'none',
      boxShadow: hovered ? `0 6px 20px ${'var(--primary)'}50` : `0 4px 12px ${'var(--primary)'}30`,
    },
    secondary: {
      background: hovered ? 'var(--bg-muted)' : 'var(--white)',
      color: 'var(--text)',
      border: `1.5px solid ${'var(--border)'}`,
      boxShadow: 'none',
    },
    danger: {
      background: hovered ? '#DC2626' : 'var(--error)',
      color: 'var(--white)',
      border: 'none',
      boxShadow: hovered ? '0 6px 20px rgba(239,68,68,0.4)' : 'none',
    },
    ghost: {
      background: hovered ? 'var(--bg-muted)' : 'transparent',
      color: 'var(--text-secondary)',
      border: 'none',
      boxShadow: 'none',
    },
    outline: {
      background: hovered ? 'var(--primary-light)' : 'transparent',
      color: 'var(--primary)',
      border: `1.5px solid ${'var(--primary)'}`,
      boxShadow: 'none',
    },
  };

  const v = variants[variant] || variants.primary;
  const s = sizes[size];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        ...s, ...v,
        borderRadius: 'var(--radius-full)',
        fontFamily: 'var(--font-body)', fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'var(--transition-fast)',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        width: fullWidth ? '100%' : 'auto',
        whiteSpace: 'nowrap',
        ...extraStyle,
      }}
    >
      {loading ? (
        <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} />
      ) : icon && <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>}
      {!loading && children}
    </button>
  );
};

// ─── Toggle ──────────────────────────────────────────────────────────
export const Toggle = ({ label, checked, onChange, description }) => {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 14px', background: checked ? 'var(--primary-light)' : 'var(--bg-muted)',
        borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'var(--transition-fast)',
        border: `1.5px solid ${checked ? 'var(--primary-mid)' : 'transparent'}`,
      }}
    >
      <div>
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)' }}>{label}</div>
        {description && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>{description}</div>}
      </div>
      <div style={{
        width: '44px', height: '24px', borderRadius: 'var(--radius-full)',
        background: checked ? 'var(--primary)' : 'var(--border)',
        position: 'relative', transition: 'var(--transition-fast)', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: '3px',
          left: checked ? '23px' : '3px',
          width: '18px', height: '18px', borderRadius: 'var(--radius-full)',
          background: 'var(--white)', transition: 'var(--transition-fast)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }} />
      </div>
    </div>
  );
};

// ─── TagInput ─────────────────────────────────────────────────────────
export const TagInput = ({ label, tags, onTagsChange, maxTags = 5, placeholder = 'Add tag...' }) => {
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);

  const addTag = (tag) => {
    const clean = tag.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (clean && !tags.includes(clean) && tags.length < maxTags) {
      onTagsChange([...tags, clean]);
    }
    setInput('');
  };

  const removeTag = (tag) => onTagsChange(tags.filter(t => t !== tag));

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-body)' }}>
          {label} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(max {maxTags})</span>
        </label>
      )}
      <div style={{
        minHeight: '46px', padding: '8px 12px',
        border: `1.5px solid ${focused ? 'var(--primary)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)', background: 'var(--white)',
        display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center',
        boxShadow: focused ? `0 0 0 3px ${'var(--primary-light)'}` : 'none',
        transition: 'var(--transition-fast)', cursor: 'text',
      }}
        onClick={() => document.getElementById('tag-input-field')?.focus()}
      >
        {tags.map(tag => (
          <span key={tag} style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)',
            background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 500,
          }}>
            #{tag}
            <button
              onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--primary)', fontSize: '12px', lineHeight: 1, padding: '0 2px',
              }}
            >×</button>
          </span>
        ))}
        <input
          id="tag-input-field"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); if (input.trim()) addTag(input); }}
          placeholder={tags.length === 0 ? placeholder : tags.length < maxTags ? 'Add more...' : ''}
          disabled={tags.length >= maxTags}
          style={{
            border: 'none', outline: 'none', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)',
            color: 'var(--text)', background: 'transparent', flex: 1, minWidth: '80px',
          }}
        />
      </div>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
        Press Enter or comma to add a tag
      </p>
    </div>
  );
};
