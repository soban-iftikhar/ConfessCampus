import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { messagesAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import AvatarOrAnon from '../components/AvatarOrAnon';
import { Spinner, EmptyState } from '../components/Loading';
import { useToast } from '../components/Toast';
import { formatTimeAgo } from '../utils/helpers';

const getSenderId = (message) => {
  const sender = message?.sender;
  if (!sender) return '';
  if (typeof sender === 'string') return sender;
  return sender._id || sender.id || '';
};

const RequestItem = ({ req, onAccept, onReject }) => {
  const [loading, setLoading] = useState('');
  const handleAccept = async () => {
    setLoading('accept');
    await onAccept(req._id);
    setLoading('');
  };
  const handleReject = async () => {
    setLoading('reject');
    await onReject(req._id);
    setLoading('');
  };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '12px 16px', background: 'var(--primary-light)',
      borderBottom: `1px solid ${'var(--border)'}`,
    }}>
      <AvatarOrAnon user={req.sender} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)' }}>{req.sender?.name}</div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Wants to message you</div>
      </div>
      <button
        onClick={handleAccept}
        disabled={!!loading}
        style={{
          padding: '6px 12px', background: 'var(--primary)', color: 'var(--white)',
          border: 'none', borderRadius: 'var(--radius-full)', cursor: 'pointer',
          fontSize: 'var(--text-xs)', fontWeight: 600, fontFamily: 'var(--font-body)',
        }}
      >
        {loading === 'accept' ? '...' : 'Y'}
      </button>
      <button
        onClick={handleReject}
        disabled={!!loading}
        style={{
          padding: '6px 12px', background: 'var(--bg-muted)', color: 'var(--text-secondary)',
          border: 'none', borderRadius: 'var(--radius-full)', cursor: 'pointer',
          fontSize: 'var(--text-xs)', fontWeight: 600, fontFamily: 'var(--font-body)',
        }}
      >
        {loading === 'reject' ? '...' : 'N'}
      </button>
    </div>
  );
};

const ChatBubble = ({ message, isMe }) => (
  <div style={{
    display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start',
    marginBottom: '10px', animation: 'fadeIn 0.2s ease',
  }}>
    <div style={{
      maxWidth: '72%', minWidth: '120px', padding: '10px 14px',
      borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
      background: isMe ? 'var(--primary)' : 'var(--white)',
      color: isMe ? 'var(--white)' : 'var(--text)',
      boxShadow: 'var(--shadow-sm)',
      border: isMe ? 'none' : `1px solid ${'var(--border)'}`,
    }}>
      <p style={{ wordBreak: 'break-word', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
        {message.content}
      </p>
      <div style={{
        display: 'flex', justifyContent: 'space-between', gap: '8px',
        marginTop: '6px', fontSize: '10px', opacity: 0.75,
      }}>
        <span>{isMe ? 'You' : (message.sender?.name || 'User')}</span>
        <span>
          {formatTimeAgo(message.createdAt)}
          {message._id?.startsWith('temp-') ? ' · Sending...' : ''}
        </span>
      </div>
    </div>
  </div>
);

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [chats, setChats] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const bottomRef = useRef();
  const currentUserId = String(user?._id || user?.id || '');

  useEffect(() => {
    fetchChats();
    fetchRequests();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChats = async () => {
    setLoadingChats(true);
    try {
      const data = await messagesAPI.getChats();
      setChats(data.chats || []);
    } catch {}
    setLoadingChats(false);
  };

  const fetchRequests = async () => {
    try {
      const data = await messagesAPI.getRequests();
      setRequests((data.requests || []).filter(r => r.status === 'pending'));
    } catch {}
  };

  const openChat = async (chat) => {
    setActiveChat(chat);
    setLoadingMessages(true);
    try {
      const data = await messagesAPI.getMessages(chat._id);
      setMessages(data.messages || []);
    } catch {}
    setLoadingMessages(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeChat || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);
    const tempId = 'temp-' + Date.now();
    const tempMsg = { _id: tempId, chatId: activeChat._id, sender: { _id: user._id }, content, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);
    try {
      const data = await messagesAPI.sendMessage(activeChat._id, content);
      setMessages(prev => prev.map(m => m._id === tempId ? (data.msg || tempMsg) : m));
      setChats(prev => prev.map(c =>
        c._id === activeChat._id ? {
          ...c,
          lastMessage: data.msg || tempMsg,
          lastMessageTime: new Date().toISOString(),
        } : c
      ));
    } catch (err) {
      setMessages(prev => prev.filter(m => m._id !== tempId));
      toast.error('Failed to send message');
    }
    setSending(false);
  };

  const handleAccept = async (reqId) => {
    try {
      await messagesAPI.acceptRequest(reqId);
      setRequests(prev => prev.filter(r => r._id !== reqId));
      toast.success('Chat request accepted!');
      fetchChats();
    } catch (err) {
      toast.error(err.message || 'Failed');
    }
  };

  const handleReject = async (reqId) => {
    try {
      await messagesAPI.rejectRequest(reqId);
      setRequests(prev => prev.filter(r => r._id !== reqId));
    } catch {}
  };

  const getOtherUser = (chat) =>
    String(chat.user1?._id || chat.user1 || '') === currentUserId ? chat.user2 : chat.user1;

  const formatPreview = (chat) => {
    const lastMessage = chat.lastMessage;
    if (!lastMessage) return 'Start chatting...';

    const lastMessageSenderId = getSenderId(lastMessage);
    const isFromMe = lastMessageSenderId && String(lastMessageSenderId) === currentUserId;
    const prefix = isFromMe ? 'You: ' : `${lastMessage.sender?.name || getOtherUser(chat)?.name || 'User'}: `;
    const content = typeof lastMessage === 'string'
      ? lastMessage
      : (lastMessage.content || 'Start chatting...');
    return `${prefix}${content}`;
  };

  return (
    <Layout noFooter>
      <div style={{
        maxWidth: '1100px', margin: '0 auto', padding: '24px 16px',
        height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-xl)',
          color: 'var(--text)', marginBottom: '16px',
        }}>
          ✉️ Messages
          {requests.length > 0 && (
            <span
              onClick={() => setShowRequests(!showRequests)}
              style={{
                marginLeft: '10px', padding: '3px 10px', borderRadius: 'var(--radius-full)',
                background: 'var(--rose)', color: 'var(--white)', fontSize: 'var(--text-xs)',
                fontWeight: 700, cursor: 'pointer',
              }}
            >
              {requests.length} request{requests.length > 1 ? 's' : ''}
            </span>
          )}
        </h1>

        <div style={{
          flex: 1, display: 'grid',
          gridTemplateColumns: '300px 1fr',
          gap: '0', background: 'var(--white)',
          borderRadius: 'var(--radius-xl)', border: `1px solid ${'var(--border)'}`,
          boxShadow: 'var(--shadow-md)', overflow: 'hidden', minHeight: 0,
        }}>
          {/* Left panel - chat list */}
          <div style={{ borderRight: `1px solid ${'var(--border)'}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: `1px solid ${'var(--border-light)'}` }}>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text)' }}>Conversations</p>
            </div>

            {/* Requests */}
            {showRequests && requests.map(req => (
              <RequestItem key={req._id} req={req} onAccept={handleAccept} onReject={handleReject} />
            ))}

            {/* Chat list */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loadingChats ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
                  <Spinner />
                </div>
              ) : chats.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                  <p style={{ fontSize: '15px', marginBottom: '8px', fontWeight: 600 }}>Start a conversation</p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>No chats yet</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Send a message request from someone's profile
                  </p>
                </div>
              ) : chats.map(chat => {
                const other = getOtherUser(chat);
                const isActive = activeChat?._id === chat._id;
                return (
                  <button
                    key={chat._id}
                    onClick={() => openChat(chat)}
                    style={{
                      width: '100%', padding: '14px 16px',
                      display: 'flex', alignItems: 'center', gap: '12px',
                      background: isActive ? 'var(--primary-light)' : 'transparent',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      borderLeft: isActive ? `3px solid ${'var(--primary)'}` : '3px solid transparent',
                      transition: 'var(--transition-fast)',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-muted)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <AvatarOrAnon user={other} size={40} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>
                        {other?.name}
                      </div>
                      <div style={{
                        fontSize: 'var(--text-xs)', color: 'var(--text-muted)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {formatPreview(chat)}
                      </div>
                    </div>
                    {chat.lastMessageTime && (
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0 }}>
                        {formatTimeAgo(chat.lastMessageTime)}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right panel - messages */}
          {activeChat ? (
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              {/* Chat header */}
              <div style={{
                padding: '14px 20px', borderBottom: `1px solid ${'var(--border-light)'}`,
                display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--white)',
              }}>
                <AvatarOrAnon user={getOtherUser(activeChat)} size={36} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text)' }}>
                    {getOtherUser(activeChat)?.name}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    Messages auto-delete after 24 hours ⏳
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: 'var(--bg)' }}>
                {loadingMessages ? (
                  <div style={{ display: 'flex', justifyContent: 'center' }}><Spinner /></div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: '32px', marginBottom: '8px' }}></p>
                    <p style={{ fontSize: 'var(--text-sm)' }}>Say hello to start the conversation!</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <ChatBubble
                      key={msg._id}
                      message={msg}
                      isMe={String(getSenderId(msg)) === currentUserId}
                    />
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{
                padding: '14px 16px', borderTop: `1px solid ${'var(--border)'}`,
                display: 'flex', gap: '10px', background: 'var(--white)',
              }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Type a message... (Enter to send)"
                  maxLength={1000}
                  style={{
                    flex: 1, padding: '11px 16px',
                    border: `1.5px solid ${'var(--border)'}`, borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)',
                    color: 'var(--text)', background: 'var(--bg)', outline: 'none',
                    transition: 'var(--transition-fast)',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'var(--white)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg)'; }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  style={{
                    width: '44px', height: '44px', borderRadius: 'var(--radius-full)',
                    background: input.trim() ? 'var(--primary)' : 'var(--bg-muted)',
                    color: input.trim() ? 'var(--white)' : 'var(--text-muted)',
                    border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', transition: 'var(--transition-fast)', flexShrink: 0,
                  }}
                >
                  {sending ? <Spinner size={16} color={'var(--white)'} /> : '➤'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: '12px', color: 'var(--text-muted)',
            }}>
              <span style={{ fontSize: '48px' }}>✉️</span>
              <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--text)' }}>
                Select a conversation
              </p>
              <p style={{ fontSize: 'var(--text-sm)', maxWidth: '260px', textAlign: 'center', lineHeight: 1.6 }}>
                Choose from your chats on the left, or send a message request from someone's profile.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
