import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/config';
import AvatarOrAnon from './AvatarOrAnon';
import { Toggle } from './FormComponents';
import { Spinner } from './Loading';
import { formatTimeAgo } from '../utils/helpers';

const CommentItem = ({ comment, postOwnerId, onDelete }) => {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const commentAuthorId = comment.user?._id || comment.user;
  const isOwner = !!user?._id && !!commentAuthorId && String(user._id) === String(commentAuthorId);
  const authorLabel = comment.isAnonymous
    ? (isOwner ? 'Anonymous · You' : 'Anonymous')
    : (isOwner ? 'You' : (comment.user?.name || 'User'));

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    setDeleting(true);
    try {
      await apiRequest(`/comments/${comment._id}`, { method: 'DELETE' });
      onDelete(comment._id);
    } catch {}
    setDeleting(false);
  };

  return (
    <div className="fade-in" style={{
      display: 'flex', gap: '12px', padding: '14px 0',
      borderBottom: `1px solid ${'var(--border-light)'}`,
    }}>
      <AvatarOrAnon user={comment.user} isAnonymous={comment.isAnonymous} size={34} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
          <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', fontFamily: 'var(--font-body)' }}>
            {authorLabel}
          </span>
          {!comment.isAnonymous && !isOwner && comment.user?.username && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              @{comment.user.username}
            </span>
          )}
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            {formatTimeAgo(comment.createdAt)}
          </span>
        </div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          {comment.content}
        </p>
      </div>
      {isOwner && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: 'var(--text-xs)', flexShrink: 0,
            padding: '4px', borderRadius: 'var(--radius-sm)', transition: 'var(--transition-fast)',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--rose)'; e.currentTarget.style.background = 'var(--rose-light)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
          title="Delete comment"
        >
          {deleting ? '...' : 'Delete'}
        </button>
      )}
    </div>
  );
};

const CommentSection = ({ postId, commentsCount }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await apiRequest(`/comments/post/${postId}`);
      setComments(data.comments || []);
    } catch {}
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!user) { navigate('/login'); return; }
    if (!content.trim()) { setError('Comment cannot be empty'); return; }
    if (content.length > 300) { setError('Max 300 characters'); return; }
    setError('');
    setSubmitting(true);
    try {
      const data = await apiRequest('/comments', {
        method: 'POST',
        body: JSON.stringify({ postId: postId, content: content.trim(), isAnonymous }),
      });
      setComments(prev => [data.comment, ...prev]);
      setContent('');
    } catch (err) {
      setError(err.message || 'Failed to post comment');
    }
    setSubmitting(false);
  };

  const handleDelete = (commentId) => {
    setComments(prev => prev.filter(c => c._id !== commentId));
  };

  return (
    <div style={{
      background: 'var(--white)', borderRadius: 'var(--radius-xl)',
      border: `1.5px solid ${'var(--border)'}`, overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px', borderBottom: `1px solid ${'var(--border-light)'}`,
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-md)', color: 'var(--text)' }}>
          Comments
        </span>
        <span style={{
          padding: '2px 10px', borderRadius: 'var(--radius-full)', background: 'var(--primary-light)',
          color: 'var(--primary)', fontSize: 'var(--text-xs)', fontWeight: 600,
        }}>
          {comments.length}
        </span>
      </div>

      {/* Comment input */}
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${'var(--border-light)'}`, background: 'var(--bg)' }}>
        {user ? (
          <div style={{ display: 'flex', gap: '12px' }}>
            <AvatarOrAnon user={isAnonymous ? null : user} isAnonymous={isAnonymous} size={36} />
            <div style={{ flex: 1 }}>
              <textarea
                value={content}
                onChange={e => { setContent(e.target.value); if (error) setError(''); }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Write a comment..."
                maxLength={300}
                rows={focused ? 3 : 1}
                style={{
                  width: '100%', padding: '10px 14px',
                  border: `1.5px solid ${focused ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)',
                  color: 'var(--text)', background: 'var(--white)', resize: 'none',
                  outline: 'none', transition: 'var(--transition-normal)', lineHeight: 1.5,
                  boxShadow: focused ? `0 0 0 3px ${'var(--primary-light)'}` : 'none',
                }}
              />
              {error && <p style={{ color: 'var(--error)', fontSize: 'var(--text-xs)', marginTop: '4px' }}>⚠️ {error}</p>}
              {(focused || content) && (
                <div className="slide-down" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginTop: '8px', gap: '12px', flexWrap: 'wrap',
                }}>
                  <div
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      cursor: 'pointer', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)',
                    }}
                  >
                    <div style={{
                      width: '32px', height: '18px', borderRadius: '999px',
                      background: isAnonymous ? 'var(--primary)' : 'var(--border)',
                      position: 'relative', transition: 'var(--transition-fast)',
                    }}>
                      <div style={{
                        position: 'absolute', top: '2px',
                        left: isAnonymous ? '16px' : '2px',
                        width: '14px', height: '14px', borderRadius: '50%',
                        background: 'var(--white)', transition: 'var(--transition-fast)',
                      }} />
                    </div>
                    <span>{isAnonymous ? 'Anonymous' : 'Public'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: content.length > 270 ? 'var(--error)' : 'var(--text-muted)' }}>
                      {content.length}/300
                    </span>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || !content.trim()}
                      style={{
                        padding: '7px 18px', background: 'var(--primary)', color: 'var(--white)',
                        border: 'none', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-body)',
                        fontWeight: 600, fontSize: 'var(--text-sm)', cursor: submitting || !content.trim() ? 'not-allowed' : 'pointer',
                        opacity: submitting || !content.trim() ? 0.6 : 1, transition: 'var(--transition-fast)',
                        display: 'flex', alignItems: 'center', gap: '6px',
                      }}
                    >
                      {submitting ? <Spinner size={14} color="#fff" /> : null}
                      Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            style={{
              width: '100%', padding: '12px', background: 'var(--primary-light)',
              border: `1.5px dashed ${'var(--primary-mid)'}`, borderRadius: 'var(--radius-lg)',
              color: 'var(--primary)', fontFamily: 'var(--font-body)', fontWeight: 600,
              fontSize: 'var(--text-sm)', cursor: 'pointer',
            }}
          >
            Sign in to comment
          </button>
        )}
      </div>

      {/* Comments list */}
      <div style={{ padding: '0 20px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
            <Spinner />
          </div>
        ) : comments.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            No comments yet. Be the first!
          </div>
        ) : (
          comments.map(comment => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
