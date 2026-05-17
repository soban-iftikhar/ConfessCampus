const categoryMeta = {
  confession: { label: 'Confession', emoji: '', bg: 'var(--confession-bg)', text: 'var(--confession-text)', border: 'var(--confession-border)' },
  discussion: { label: 'Discussion', emoji: '', bg: 'var(--discussion-bg)', text: 'var(--discussion-text)', border: 'var(--discussion-border)' },
  'lost-found': { label: 'Lost & Found', emoji: '', bg: 'var(--lost-found-bg)', text: 'var(--lost-found-text)', border: 'var(--lost-found-border)' },
  carpool: { label: 'Carpool', emoji: '', bg: 'var(--carpool-bg)', text: 'var(--carpool-text)', border: 'var(--carpool-border)' },
};






import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Flag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/config';
import { formatTimeAgo, truncateText } from '../utils/helpers';
import CategoryBadge from './CategoryBadge';
import AvatarOrAnon from './AvatarOrAnon';

const PostCard = ({ post, onUpdate }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.likes?.includes(user?._id));
  const [likesCount, setLikesCount] = useState(post.likesCount ?? post.likes?.length ?? 0);
  const [liking, setLiking] = useState(false);
  const [hovered, setHovered] = useState(false);

  const meta = categoryMeta[post.category] || categoryMeta.discussion;
  const isOwner = user?._id === post.user?._id;

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    if (liking) return;
    setLiking(true);
    try {
      const endpoint = liked ? `/posts/${post._id}/unlike` : `/posts/${post._id}/like`;
      const data = await apiRequest(endpoint, { method: 'POST' });
      setLiked(!liked);
      setLikesCount(data.likesCount);
    } catch {}
    setLiking(false);
  };

  const handleCardClick = () => navigate(`/post/${post._id}`);

  // Category-specific extra info
  const renderExtra = () => {
    if (post.category === 'lost-found') {
      return (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
          marginTop: '10px',
        }}>
          {post.itemType && (
            <span style={{
              padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)',
              fontWeight: 600, background: post.itemType === 'lost' ? 'var(--error-light)' : 'var(--success-light)',
              color: post.itemType === 'lost' ? 'var(--error)' : 'var(--success)',
            }}>
              {post.itemType === 'lost' ? 'Lost' : 'Found'}
            </span>
          )}
          {post.location && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              {post.location}
            </span>
          )}
        </div>
      );
    }

    if (post.category === 'carpool') {
      return (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px',
          padding: '10px 12px', background: meta.bg, borderRadius: 'var(--radius-md)',
        }}>
          {post.departure && post.destination && (
            <span style={{ fontSize: 'var(--text-xs)', color: meta.text, fontWeight: 600 }}>
              {post.departure} {'\u2192'} {post.destination}
            </span>
          )}
          {post.seatsAvailable !== undefined && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              {post.seatsAvailable} seat{post.seatsAvailable !== 1 ? 's' : ''} available
            </span>
          )}
          {post.departureTime && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              {new Date(post.departureTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      );
    }

    if (post.category === 'discussion' && post.isResolved) {
      return (
        <div style={{ marginTop: '8px' }}>
          <span style={{
            padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)',
            fontWeight: 600, background: 'var(--success-light)', color: 'var(--success)',
          }}>Resolved</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--white)', borderRadius: 'var(--radius-xl)',
        border: `1.5px solid ${hovered ? 'var(--primary-mid)' : 'var(--border)'}`,
        boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        padding: '20px', cursor: 'pointer',
        transition: 'var(--transition-normal)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        animation: 'fadeIn 0.3s ease forwards',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          <AvatarOrAnon user={post.user} isAnonymous={post.isAnonymous} size={36} />
          <div style={{ minWidth: 0 }}>
            {post.isAnonymous ? (
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-body)' }}>
                Anonymous
              </div>
            ) : (
              <Link
                to={`/profile/${post.user?._id}`}
                onClick={e => e.stopPropagation()}
                style={{
                  fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)',
                  fontFamily: 'var(--font-body)', textDecoration: 'none', cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text)'; }}
              >
                {post.user?.name || 'Unknown'}
              </Link>
            )}
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {post.isAnonymous ? '' : (post.user?.username ? `@${post.user.username} · ` : '')}
              {formatTimeAgo(post.createdAt)}
            </div>
          </div>
        </div>
        <CategoryBadge category={post.category} />
      </div>

      {/* Title (discussion, carpool) */}
      {post.title && (
        <h3 style={{
          fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-md)',
          color: 'var(--text)', marginBottom: '6px', lineHeight: 1.3,
        }}>
          {post.title}
        </h3>
      )}

      {/* Content */}
      <p style={{
        fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
        lineHeight: 1.65, marginBottom: '4px',
      }}>
        {truncateText(post.content, 180)}
      </p>

      {/* Category extras */}
      {renderExtra()}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
          {post.tags.slice(0, 4).map(tag => (
            <span
              key={tag}
              onClick={e => { e.stopPropagation(); navigate(`/search?tag=${tag}`); }}
              style={{
                padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)',
                background: 'var(--bg-muted)', color: 'var(--primary)', fontWeight: 500,
                cursor: 'pointer', transition: 'var(--transition-fast)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-muted)'}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer actions */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        marginTop: '14px', paddingTop: '14px',
        borderTop: `1px solid ${'var(--border-light)'}`,
      }}>
        {/* Like */}
        <button
          onClick={handleLike}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px',
            borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
            background: liked ? 'var(--rose-light)' : 'transparent',
            color: liked ? 'var(--rose)' : 'var(--text-secondary)',
            fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)', fontWeight: 500,
            transition: 'var(--transition-fast)',
            animation: liking ? 'heartBeat 0.4s ease' : 'none',
          }}
          onMouseEnter={e => { if (!liked) e.currentTarget.style.background = 'var(--bg-muted)'; }}
          onMouseLeave={e => { if (!liked) e.currentTarget.style.background = 'transparent'; }}
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          <span>{likesCount}</span>
        </button>

        {/* Comments */}
        <button
          onClick={handleCardClick}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px',
            borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
            background: 'transparent', color: 'var(--text-secondary)',
            fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)', fontWeight: 500,
            transition: 'var(--transition-fast)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <MessageCircle size={16} />
          <span>Comments</span>
          <span>{post.commentsCount ?? post.comments?.length ?? 0}</span>
        </button>

        {/* Share */}
        <button
          onClick={e => {
            e.stopPropagation();
            navigator.clipboard?.writeText(window.location.origin + `/post/${post._id}`);
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px',
            borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
            background: 'transparent', color: 'var(--text-secondary)',
            fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)', fontWeight: 500,
            transition: 'var(--transition-fast)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Share2 size={16} />
        </button>

        <div style={{ flex: 1 }} />

        {/* Report */}
        {user && !isOwner && (
          <button
            onClick={e => { e.stopPropagation(); navigate(`/report/post/${post._id}`); }}
            style={{
              padding: '6px 10px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
              background: 'transparent', color: 'var(--text-muted)', fontSize: 'var(--text-xs)',
              transition: 'var(--transition-fast)',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--rose)'; e.currentTarget.style.background = 'var(--rose-light)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
            title="Report post"
          >
            <Flag size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default PostCard;
