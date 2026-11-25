import React, { useState, useEffect, useRef } from 'react';
import { WEBHOOK_URL } from '../config';
import inbarajAvatar from '../assets/avatar.png';

// Helper to format HH:mm time
function formatTime(timestamp) {
  const d = timestamp ? new Date(timestamp) : new Date();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Convert literal \n or \r\n to actual newlines
function formatMessageText(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n');
}

// Bot Avatar component using the graduate student avatar
function BotAvatar({ className = '' }) {
  return (
    <div className={`avatar bot-avatar ${className}`} aria-hidden="true">
      <img
        src={inbarajAvatar}
        alt="Inbaraj Avatar"
        className="bot-avatar-img"
      />
    </div>
  );
}

// Swipeable Brochure Gallery component
function BrochureGallery({ urls, onImageClick }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedImages, setFailedImages] = useState({});
  const [touchStartX, setTouchStartX] = useState(null);

  if (!urls || urls.length === 0) return null;

  const total = urls.length;
  const currentUrl = urls[currentIndex];
  const hasFailed = Boolean(failedImages[currentIndex]);

  const handlePrev = (e) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.changedTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (diff > 40 && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else if (diff < -40 && currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
    setTouchStartX(null);
  };

  return (
    <div
      className="brochure-gallery"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Gallery Header */}
      <div className="gallery-header">
        <div className="gallery-title">
          <svg className="icon-doc" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <span>College Brochure</span>
        </div>
        <span className="gallery-counter">{currentIndex + 1} / {total}</span>
      </div>

      {/* Main Image Area with Left/Right Buttons */}
      <div className="gallery-main">
        {hasFailed ? (
          <div className="gallery-fallback">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="fallback-icon">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <line x1="21" y1="15" x2="16" y2="10"/>
              <line x1="3" y1="21" x2="9" y2="15"/>
              <line x1="2" y1="2" x2="22" y2="22"/>
            </svg>
            <p className="fallback-text">Brochure image unavailable</p>
          </div>
        ) : (
          <div
            className="gallery-image-wrap"
            onClick={() => onImageClick(currentUrl, currentIndex, urls)}
            role="button"
            tabIndex="0"
            aria-label={`View full size brochure page ${currentIndex + 1}`}
          >
            <img
              src={currentUrl}
              alt={`Brochure Page ${currentIndex + 1}`}
              className="gallery-image"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setFailedImages((prev) => ({ ...prev, [currentIndex]: true }))}
            />
            <div className="gallery-zoom-overlay">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="11" y1="8" x2="11" y2="14"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
              <span>Click to enlarge</span>
            </div>
          </div>
        )}

        {/* Left Arrow Button */}
        {total > 1 && (
          <button
            type="button"
            className="gallery-nav-btn btn-prev"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            aria-label="Previous brochure page"
            title="Previous page"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {/* Right Arrow Button */}
        {total > 1 && (
          <button
            type="button"
            className="gallery-nav-btn btn-next"
            onClick={handleNext}
            disabled={currentIndex === total - 1}
            aria-label="Next brochure page"
            title="Next page"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>

      {/* Small Dots */}
      {total > 1 && (
        <div className="gallery-dots" role="tablist" aria-label="Brochure pages">
          {urls.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`gallery-dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              aria-label={`Go to page ${idx + 1}`}
              aria-selected={idx === currentIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Chatbot() {
  // Session ID management
  const [sessionId, setSessionId] = useState(() => {
    const saved = sessionStorage.getItem('inbaraj_chat_sessionId');
    if (saved) return saved;
    const newId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    sessionStorage.setItem('inbaraj_chat_sessionId', newId);
    return newId;
  });

  // Messages management
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('inbaraj_chat_messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Conversation started state
  const [hasStarted, setHasStarted] = useState(() => {
    const savedFlag = sessionStorage.getItem('inbaraj_chat_hasStarted');
    if (savedFlag === 'true') return true;
    try {
      const savedMsgs = sessionStorage.getItem('inbaraj_chat_messages');
      if (savedMsgs && JSON.parse(savedMsgs).length > 0) return true;
    } catch {}
    return false;
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lightboxData, setLightboxData] = useState(null); // { url, index, urls }
  const [copiedId, setCopiedId] = useState(null);

  // 3-dots Menu & Chat History state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState(() => {
    try {
      const saved = localStorage.getItem('inbaraj_chat_history_list');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const menuRef = useRef(null);

  // Sync state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('inbaraj_chat_messages', JSON.stringify(messages));
    // Also save active session to history list
    if (messages.length > 0) {
      setHistoryList((prev) => {
        const firstUser = messages.find((m) => m.sender === 'user')?.text || 'Conversation';
        const title = firstUser.length > 36 ? firstUser.substring(0, 36) + '...' : firstUser;
        const entry = {
          id: sessionId,
          title,
          timestamp: Date.now(),
          messages
        };
        const filtered = prev.filter((item) => item.id !== sessionId);
        const updated = [entry, ...filtered].slice(0, 25);
        try {
          localStorage.setItem('inbaraj_chat_history_list', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  }, [messages, sessionId]);

  useEffect(() => {
    sessionStorage.setItem('inbaraj_chat_hasStarted', hasStarted ? 'true' : 'false');
  }, [hasStarted]);

  // Auto-scroll when messages update or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus textarea when conversation starts or loading finishes
  useEffect(() => {
    if (hasStarted && !isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [hasStarted, isLoading]);

  // Adjust textarea height when value changes or resets
  const adjustTextareaHeight = (reset = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    if (reset) {
      textarea.style.height = 'auto';
      return;
    }
    textarea.style.height = 'auto';
    const computedHeight = Math.min(Math.max(textarea.scrollHeight, 40), 120);
    textarea.style.height = `${computedHeight}px`;
  };

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setLightboxData(null);
        setIsMenuOpen(false);
        setIsHistoryOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Send message to webhook
  const sendMessage = async (text, isStart = false) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessage = {
      id: 'user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setHasStarted(true);
    setInputValue('');
    adjustTextareaHeight(true);
    setIsLoading(true);

    try {
      const payload = {
        sessionId,
        start: isStart,
        message: trimmed
      };

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Tolerant response parsing
      let replyText = '';
      let brochureUrls = [];

      if (typeof data === 'string') {
        replyText = data;
      } else {
        let item = data;
        if (Array.isArray(data)) {
          item = data[0] || {};
        }
        const root = (item && item.data && typeof item.data === 'object' && !Array.isArray(item.data))
          ? item.data
          : item;

        const rawReply = root?.reply ?? root?.output ?? item?.reply ?? item?.output ?? item?.message ?? item?.text;
        if (rawReply !== undefined && rawReply !== null) {
          replyText = typeof rawReply === 'object' ? JSON.stringify(rawReply) : String(rawReply);
        }

        // Support brochure_urls (array)
        const rawUrls = root?.brochure_urls ?? item?.brochure_urls;
        if (Array.isArray(rawUrls)) {
          brochureUrls = rawUrls.filter((u) => typeof u === 'string' && u.trim());
        } else if (typeof rawUrls === 'string' && rawUrls.trim()) {
          brochureUrls = [rawUrls.trim()];
        }

        // Keep supporting the old single brochure_url field too
        const singleUrl = root?.brochure_url || root?.brochureUrl || item?.brochure_url || item?.brochureUrl;
        if (brochureUrls.length === 0 && typeof singleUrl === 'string' && singleUrl.trim()) {
          brochureUrls = [singleUrl.trim()];
        }
      }

      if (!replyText && brochureUrls.length === 0) {
        throw new Error('Empty response from webhook');
      }

      const botMessage = {
        id: 'bot-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        sender: 'bot',
        text: replyText,
        brochure_urls: brochureUrls.length > 0 ? brochureUrls : null,
        brochure_url: brochureUrls.length > 0 ? brochureUrls[0] : null,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('Webhook error:', err);
      const errorMessage = {
        id: 'bot-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        sender: 'bot',
        text: 'Sorry, something went wrong. Please try again.',
        brochure_urls: null,
        brochure_url: null,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Start conversation button click handler
  const handleStartConversation = () => {
    sendMessage('Start Conversation', true);
  };

  // Keydown handler: Shift + Enter creates newline, Enter sends message
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift + Enter creates a newline
        return;
      }
      e.preventDefault();
      if (!inputValue.trim() || isLoading) return;
      sendMessage(inputValue, false);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    const computedHeight = Math.min(Math.max(e.target.scrollHeight, 40), 120);
    e.target.style.height = `${computedHeight}px`;
  };

  // Copy message text helper
  const handleCopyText = (msgId, text) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Reset chat / new chat
  const handleNewChat = () => {
    const newId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);

    setSessionId(newId);
    sessionStorage.setItem('inbaraj_chat_sessionId', newId);
    setMessages([]);
    sessionStorage.removeItem('inbaraj_chat_messages');
    setHasStarted(false);
    sessionStorage.setItem('inbaraj_chat_hasStarted', 'false');
    setInputValue('');
    adjustTextareaHeight(true);
    setIsLoading(false);
    setIsMenuOpen(false);
  };

  // Load a chat from history
  const handleLoadSession = (historyItem) => {
    if (!historyItem) return;
    setSessionId(historyItem.id);
    sessionStorage.setItem('inbaraj_chat_sessionId', historyItem.id);
    setMessages(historyItem.messages || []);
    setHasStarted(true);
    sessionStorage.setItem('inbaraj_chat_hasStarted', 'true');
    setIsHistoryOpen(false);
  };

  // Delete an individual history item
  const handleDeleteHistoryItem = (e, idToDelete) => {
    e.stopPropagation();
    setHistoryList((prev) => {
      const updated = prev.filter((item) => item.id !== idToDelete);
      try {
        localStorage.setItem('inbaraj_chat_history_list', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Clear all history
  const handleClearAllHistory = () => {
    setHistoryList([]);
    try {
      localStorage.removeItem('inbaraj_chat_history_list');
    } catch {}
  };

  return (
    <div className="chat-card" role="region" aria-label="College AI Chatbot">
      {/* HEADER */}
      <header className="chat-header">
        <div className="header-left">
          <div className="avatar-wrapper">
            <BotAvatar className="avatar-header" />
            <span className="online-dot" title="Inbaraj is online" aria-label="Online indicator"></span>
          </div>

          <div className="header-info">
            <div className="header-title-row">
              <h1 className="bot-name">Inbaraj</h1>
              <span className="badge-ai">Campus Advisor</span>
            </div>
            <div className="college-row">
              <svg className="icon-college" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
              <p className="college-name" title="Dr. MGR Educational and Research Institute (Chennai)">
                Dr. MGR Educational &amp; Research Institute
              </p>
            </div>
          </div>
        </div>

        {/* HEADER 3-DOTS MENU */}
        <div className="header-right" ref={menuRef}>
          <button
            type="button"
            className="icon-dots-btn"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="More options"
            aria-expanded={isMenuOpen}
            title="Options menu"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="icon-dots" aria-hidden="true">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>

          {/* 3-DOTS DROPDOWN */}
          {isMenuOpen && (
            <div className="dropdown-menu" role="menu">
              <button
                type="button"
                className="dropdown-item"
                role="menuitem"
                onClick={handleNewChat}
              >
                <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>New conversation</span>
              </button>

              <button
                type="button"
                className="dropdown-item"
                role="menuitem"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsHistoryOpen(true);
                }}
              >
                <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Chat history</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* MESSAGE AREA */}
      <main className="messages-area" tabIndex="0" aria-label="Conversation messages">
        {!hasStarted && messages.length === 0 ? (
          <div className="start-screen">
<div className="start-aura">
              <BotAvatar className="avatar-start" />
            </div>

            <div className="start-badge-pill">
              <span className="sparkle-icon">🎓</span>
              <span>Official Admissions Assistant</span>
            </div>

            <h2 className="start-title">Hello! I'm Inbaraj</h2>
            <p className="start-description">
              Welcome to <strong>Dr. MGR Educational and Research Institute</strong>, Chennai.
              Ask me about admissions, degree courses, fees, or campus facilities.
            </p>

            <div className="start-features-grid">
              <div className="feature-chip">
                <span className="feature-icon">🎓</span>
                <span>Admissions 2027</span>
              </div>
              <div className="feature-chip">
                <span className="feature-icon">📚</span>
                <span>Courses &amp; Fees</span>
              </div>
              <div className="feature-chip">
                <span className="feature-icon">🏛️</span>
                <span>Campus Life</span>
              </div>
            </div>

            <button
              type="button"
              className="start-button"
              onClick={handleStartConversation}
              aria-label="Start Conversation"
            >
              <span>Start Conversation</span>
              <svg
                className="icon-arrow"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg) => {
              // Normalize brochure URLs (support brochure_urls array and brochure_url string)
              const brochureList = (Array.isArray(msg.brochure_urls) && msg.brochure_urls.length > 0)
                ? msg.brochure_urls
                : (msg.brochure_url ? [msg.brochure_url] : []);

              return (
                <div
                  key={msg.id}
                  className={`message-row ${msg.sender === 'user' ? 'message-row-user' : 'message-row-bot'}`}
                >
                  {msg.sender === 'bot' && (
                    <BotAvatar className="avatar-message" />
                  )}

                  <div className="message-wrapper">
                    <div className={`message-bubble ${msg.sender === 'user' ? 'bubble-user' : 'bubble-bot'}`}>
                      <div className="message-text">
                        {formatMessageText(msg.text)}
                      </div>

                      {/* SWIPEABLE BROCHURE GALLERY */}
                      {brochureList.length > 0 && (
                        <BrochureGallery
                          urls={brochureList}
                          onImageClick={(url, idx, allUrls) => {
                            setLightboxData({ url, index: idx, urls: allUrls });
                          }}
                        />
                      )}

                      {msg.sender === 'bot' && (
                        <div className="bot-bubble-actions">
                          <button
                            type="button"
                            className="action-icon-btn"
                            onClick={() => handleCopyText(msg.id, msg.text)}
                            title="Copy text"
                            aria-label="Copy response text"
                          >
                            {copiedId === msg.id ? (
                              <span className="copied-text">✓ Copied</span>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                              </svg>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    <span className={`message-time ${msg.sender === 'user' ? 'time-user' : 'time-bot'}`}>
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Modern Typing indicator */}
            {isLoading && (
              <div className="message-row message-row-bot">
                <BotAvatar className="avatar-message" />
                <div className="message-wrapper">
                  <div className="message-bubble bubble-bot typing-bubble" aria-label="Inbaraj is typing">
                    <span className="typing-dot dot-1"></span>
                    <span className="typing-dot dot-2"></span>
                    <span className="typing-dot dot-3"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* INPUT AREA (Hidden until conversation starts) */}
      {hasStarted && (
        <footer className="chat-footer">
          <div className="composer-wrapper">
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask Inbaraj a question..."
              rows={1}
              disabled={isLoading}
              aria-label="Type your message"
            />
            <button
              type="button"
              className="send-button"
              onClick={() => sendMessage(inputValue, false)}
              disabled={isLoading || !inputValue.trim()}
              aria-label="Send message"
              title="Send message"
            >
              <svg
                className="icon-send"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>
          </div>
        </footer>
      )}

      {/* LIGHTBOX MODAL */}
      {lightboxData && (
        <div
          className="lightbox-overlay"
          onClick={() => setLightboxData(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Brochure full view"
        >
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close"
              onClick={() => setLightboxData(null)}
              aria-label="Close enlarged brochure"
            >
              &times;
            </button>
            <div className="lightbox-img-wrap">
              <img
                src={lightboxData.url}
                alt={`Enlarged College Brochure Page ${lightboxData.index + 1}`}
                className="lightbox-img"
                referrerPolicy="no-referrer"
              />
            </div>
            {lightboxData.urls && lightboxData.urls.length > 1 && (
              <div className="lightbox-footer-bar">
                <button
                  type="button"
                  className="lightbox-nav-btn"
                  disabled={lightboxData.index === 0}
                  onClick={() => {
                    const newIdx = lightboxData.index - 1;
                    setLightboxData({
                      url: lightboxData.urls[newIdx],
                      index: newIdx,
                      urls: lightboxData.urls
                    });
                  }}
                  aria-label="Previous image"
                >
                  ‹ Prev
                </button>
                <span className="lightbox-counter">
                  Page {lightboxData.index + 1} of {lightboxData.urls.length}
                </span>
                <button
                  type="button"
                  className="lightbox-nav-btn"
                  disabled={lightboxData.index === lightboxData.urls.length - 1}
                  onClick={() => {
                    const newIdx = lightboxData.index + 1;
                    setLightboxData({
                      url: lightboxData.urls[newIdx],
                      index: newIdx,
                      urls: lightboxData.urls
                    });
                  }}
                  aria-label="Next image"
                >
                  Next ›
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHAT HISTORY MODAL */}
      {isHistoryOpen && (
        <div
          className="history-overlay"
          onClick={() => setIsHistoryOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Chat history"
        >
          <div className="history-modal" onClick={(e) => e.stopPropagation()}>
            <div className="history-header">
              <div className="history-title-wrap">
                <svg className="history-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <h3>Chat History</h3>
              </div>
              <button
                type="button"
                className="history-close-btn"
                onClick={() => setIsHistoryOpen(false)}
                aria-label="Close chat history"
              >
                &times;
              </button>
            </div>

            <div className="history-list">
              {historyList.length === 0 ? (
                <div className="history-empty">
                  <p>No previous conversations yet.</p>
                  <span>Conversations you have will appear here automatically.</span>
                </div>
              ) : (
                historyList.map((item) => (
                  <div
                    key={item.id}
                    className={`history-item ${item.id === sessionId ? 'active-session' : ''}`}
                    onClick={() => handleLoadSession(item)}
                    role="button"
                    tabIndex="0"
                  >
                    <div className="history-item-main">
                      <div className="history-title-row">
                        <span className="history-item-title">{item.title}</span>
                        {item.id === sessionId && <span className="active-pill">Current</span>}
                      </div>
                      <span className="history-item-meta">
                        {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} • {item.messages?.length || 0} messages
                      </span>
                    </div>
                    <button
                      type="button"
                      className="history-delete-btn"
                      onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                      title="Delete this conversation"
                      aria-label="Delete conversation"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>

            {historyList.length > 0 && (
              <div className="history-footer">
                <button
                  type="button"
                  className="history-clear-all"
                  onClick={handleClearAllHistory}
                >
                  Clear all history
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

