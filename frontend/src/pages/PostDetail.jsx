const categoryMeta = {
  confession: { label: 'Confession', bg: 'var(--confession-bg)', text: 'var(--confession-text)', border: 'var(--confession-border)' },
  discussion: { label: 'Discussion', emoji: '', bg: 'var(--discussion-bg)', text: 'var(--discussion-text)', border: 'var(--discussion-border)' },
  'lost-found': { label: 'Lost & Found', emoji: '', bg: 'var(--lost-found-bg)', text: 'var(--lost-found-text)', border: 'var(--lost-found-border)' },
  carpool: { label: 'Carpool', emoji: '', bg: 'var(--carpool-bg)', text: 'var(--carpool-text)', border: 'var(--carpool-border)' },
};






import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, Share2, Flag, ArrowLeft, Trash2 } from 'lucide-react';
import { postsAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import AvatarOrAnon from '../components/AvatarOrAnon';
import CategoryBadge from '../components/CategoryBadge';
import CommentSection from '../components/CommentSection';
import ReportModal from '../components/ReportModal';
import { FullPageLoader, ErrorState } from '../components/Loading';
import { useToast } from '../components/Toast';
import { formatTimeAgo } from '../utils/helpers';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [liking, setLiking] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    setLoading(true); setError('');
    try {
      const data = await postsAPI.getOne(id);
      setPost(data.post);
      setLiked(data.post.likes?.includes(user?._id));
      setLikesCount(data.post.likesCount ?? data.post.likes?.length ?? 0);
    } catch (err) {
      setError(err.message || 'Post not found');
    }
    setLoading(false);
  };

  const handleLike = async () => {
    if (!user) { navigate('/login'); return; }
    if (liking) return;
    setLiking(true);
    try {
      const endpoint = liked ? `/posts/${id}/unlike` : `/posts/${id}/like`;
      const data = await (liked ? postsAPI.unlike(id) : postsAPI.like(id));
      setLiked(!liked);
      setLikesCount(data.likesCount);
    } catch {}
    setLiking(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await postsAPI.delete(id);
      toast.success('Post deleted');
      navigate('/feed');
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
    setDeleting(false);
  };

  if (loading) return <Layout><FullPageLoader /></Layout>;
  if (error) return <Layout><ErrorState message={error} onRetry={fetchPost} /></Layout>;
  if (!post) return null;

  const meta = categoryMeta[post.category];
  const isOwner = user?._id === post.user?._id;

  const renderExtra = () => {
    if (post.category === 'carpool') {
      return (
        <div style={{
          padding: '16px', background: meta.bg, borderRadius: 'var(--radius-lg)',
          border: `1px solid ${meta.border}`, marginTop: '16px',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
            {[
              { icon: 'F', label: 'From', value: post.departure },
              { icon: 'T', label: 'To', value: post.destination },
              { icon: 'S', label: 'Seats', value: `${post.seatsAvailable} available` },
              { icon: 'D', label: 'Departing', value: post.departureTime ? new Date(post.departureTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : null },
            ].filter(i => i.value).map(item => (
              <div key={item.label}>
                <p style={{ fontSize: 'var(--text-xs)', color: meta.text, opacity: 0.7, fontWeight: 600, marginBottom: '2px' }}>{item.icon} {item.label}</p>
                <p style={{ fontSize: 'var(--text-sm)', color: meta.text, fontWeight: 600 }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (post.category === 'lost-found') {
      return (
        <div style={{
          padding: '14px 16px', background: meta.bg, borderRadius: 'var(--radius-lg)',
          border: `1px solid ${meta.border}`, marginTop: '16px',
          display: 'flex', flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <p style={{ fontSize: 'var(--text-xs)', color: meta.text, opacity: 0.7, fontWeight: 600, marginBottom: '2px' }}>Status</p>
            <span style={{
              padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)',
              fontWeight: 700, background: post.itemType === 'lost' ? 'var(--error-light)' : 'var(--success-light)',
              color: post.itemType === 'lost' ? 'var(--error)' : 'var(--success)',
            }}>
              {post.itemType === 'lost' ? 'Lost' : 'Found'}
            </span>
          </div>
          {post.location && (
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: meta.text, opacity: 0.7, fontWeight: 600, marginBottom: '2px' }}>Location</p>
              <p style={{ fontSize: 'var(--text-sm)', color: meta.text, fontWeight: 600 }}>{post.location}</p>
            </div>
          )}
          {post.itemDescription && (
            <div style={{ width: '100%' }}>
              <p style={{ fontSize: 'var(--text-xs)', color: meta.text, opacity: 0.7, fontWeight: 600, marginBottom: '4px' }}>Item Description</p>
              <p style={{ fontSize: 'var(--text-sm)', color: meta.text }}>{post.itemDescription}</p>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <Layout>
      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '32px 16px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', fontSize: 'var(--text-sm)',
            marginBottom: '20px', padding: 0, fontFamily: 'var(--font-body)',
            transition: 'var(--transition-fast)',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={16} /> Back to feed
        </button>

        {/* Post card */}
        <div className="fade-in" style={{
          background: 'var(--white)', borderRadius: 'var(--radius-2xl)',
          border: `1.5px solid ${'var(--border)'}`, boxShadow: 'var(--shadow-md)',
          padding: '28px', marginBottom: '20px',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <AvatarOrAnon user={post.user} isAnonymous={post.isAnonymous} size={44} />
              <div>
                {post.isAnonymous ? (
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text)', fontFamily: 'var(--font-body)' }}>
                    Anonymous
                  </div>
                ) : (
                  <Link
                    to={`/profile/${post.user?._id}`}
                    onClick={e => e.stopPropagation()}
                    style={{
                      fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text)',
                      fontFamily: 'var(--font-body)', textDecoration: 'none', cursor: 'pointer',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text)'; }}
                  >
                    {post.user?.name}
                  </Link>
                )}
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {!post.isAnonymous && post.user?.username && `@${post.user.username} · `}
                  {formatTimeAgo(post.createdAt)}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CategoryBadge category={post.category} size="lg" />
              {post.category === 'discussion' && post.isResolved && (
                <span style={{
                  padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)',
                  fontWeight: 700, background: 'var(--success-light)', color: 'var(--success)',
                }}>Resolved</span>
              )}
            </div>
          </div>

          {/* Title */}
          {post.title && (
            <h1 style={{
              fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-2xl)',
              color: 'var(--text)', marginBottom: '12px', lineHeight: 1.25, letterSpacing: '-0.3px',
            }}>
              {post.title}
            </h1>
          )}

          {/* Content */}
          <p style={{
            fontSize: 'var(--text-base)', color: 'var(--text)', lineHeight: 1.75,
            whiteSpace: 'pre-wrap', marginBottom: '8px',
          }}>
            {post.content}
          </p>

          {/* Category extras */}
          {renderExtra()}

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '16px' }}>
              {post.tags.map(tag => (
                <span
                  key={tag}
                  onClick={() => navigate(`/search?tag=${tag}`)}
                  style={{
                    padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)',
                    background: 'var(--bg-muted)', color: 'var(--primary)', fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            marginTop: '20px', paddingTop: '16px',
            borderTop: `1px solid ${'var(--border-light)'}`,
          }}>
            <button
              onClick={handleLike}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: 'var(--radius-full)', border: 'none',
                cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600,
                fontSize: 'var(--text-sm)', transition: 'var(--transition-fast)',
                background: liked ? 'var(--rose-light)' : 'var(--bg-muted)',
                color: liked ? 'var(--rose)' : 'var(--text-secondary)',
              }}
            >
              <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
              {liked ? 'Liked' : 'Like'} • {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
            </button>

            <button
              onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.info('Link copied!'); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: 'var(--radius-full)', border: 'none',
                cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500,
                fontSize: 'var(--text-sm)', background: 'var(--bg-muted)',
                color: 'var(--text-secondary)', transition: 'var(--transition-fast)',
              }}
            >
              Share
            </button>

            <div style={{ flex: 1 }} />

            {user && !isOwner && (
              <button
                onClick={() => setShowReport(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', borderRadius: 'var(--radius-full)', border: 'none',
                  cursor: 'pointer', background: 'transparent',
                  color: 'var(--text-muted)', fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-body)', transition: 'var(--transition-fast)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--rose-light)'; e.currentTarget.style.color = 'var(--rose)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <Flag size={16} />
                Report
              </button>
            )}

            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', borderRadius: 'var(--radius-full)', border: 'none',
                  cursor: 'pointer', background: 'var(--rose-light)',
                  color: 'var(--rose)', fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-body)', fontWeight: 600,
                }}
              >
                <Trash2 size={16} />
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </div>

        {/* Comments */}
        <CommentSection postId={id} commentsCount={post.commentsCount} />
      </div>

      {showReport && (
        <ReportModal itemId={id} itemType="Post" onClose={() => setShowReport(false)} />
      )}
    </Layout>
  );
};

export default PostDetail;
