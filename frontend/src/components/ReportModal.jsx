import { useState } from 'react';
import { apiRequest } from '../api/config';
import { Button } from './FormComponents';
import { useToast } from './Toast';

const reasons = [
  { value: 'sexist', label: 'Sexist content' },
  { value: 'racist', label: 'Racist content' },
  { value: 'inappropriate', label: 'Inappropriate' },
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'other', label: 'Other' },
];

const ReportModal = ({ itemId, itemType, onClose }) => {
  const toast = useToast();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!reason) { setError('Please select a reason'); return; }
    setError('');
    setSubmitting(true);
    try {
      await apiRequest('/reports/create', {
        method: 'POST',
        body: JSON.stringify({
          itemId,
          itemType,
          reason,
          description: description.trim(),
        }),
      });
      toast.success('Report submitted. We\'ll review it shortly.', 'Reported');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit report');
    }
    setSubmitting(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'var(--overlay)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="fade-in-scale" style={{
        background: 'var(--white)', borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-xl)', width: '100%', maxWidth: '440px',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: `1px solid ${'var(--border-light)'}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--text)' }}>
              Report {itemType}
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Help keep WhisperCampus safe
            </p>
          </div>
          <button onClick={onClose} style={{
            width: '32px', height: '32px', borderRadius: 'var(--radius-full)',
            background: 'var(--bg-muted)', border: 'none', cursor: 'pointer',
            fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)', marginBottom: '10px' }}>
              What's the issue?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {reasons.map(r => (
                <button
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  style={{
                    padding: '10px 14px', borderRadius: 'var(--radius-md)', textAlign: 'left',
                    border: `1.5px solid ${reason === r.value ? 'var(--primary)' : 'var(--border)'}`,
                    background: reason === r.value ? 'var(--primary-light)' : 'var(--white)',
                    color: reason === r.value ? 'var(--primary)' : 'var(--text)',
                    fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: reason === r.value ? 600 : 400,
                    cursor: 'pointer', transition: 'var(--transition-fast)',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '6px' }}>
              Additional details <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Provide more context..."
              style={{
                width: '100%', padding: '10px 14px',
                border: `1.5px solid ${'var(--border)'}`, borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)', color: 'var(--text)',
                background: 'var(--white)', outline: 'none', resize: 'vertical',
                lineHeight: 1.5,
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = `0 0 0 3px ${'var(--primary-light)'}`; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'right' }}>
              {description.length}/500
            </p>
          </div>

          {error && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--error)' }}>⚠️ {error}</p>}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px', borderTop: `1px solid ${'var(--border-light)'}`,
          display: 'flex', gap: '10px', justifyContent: 'flex-end',
        }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={handleSubmit} loading={submitting}>
            Submit Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
