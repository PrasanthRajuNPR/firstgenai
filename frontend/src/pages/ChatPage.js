import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { API } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    API.get('/chat/history')
      .then(res => {
        if (res.data.messages.length === 0) {
          setMessages([{
            role: 'assistant',
            content: `Hi ${user?.name?.split(' ')[0]}! 👋 I'm EduBot, your AI learning companion. Ask me anything about your studies, career goals, technical concepts, or how to make the most of your roadmap!`,
          }]);
        } else {
          setMessages(res.data.messages);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setSending(true);

    try {
      const res = await API.post('/chat', { message: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setSending(false);
    }
  };

  const suggestions = [
    'How do I prepare for campus placements?',
    'What topics should I focus on this week?',
    'Explain time complexity in simple terms',
    'How to build a strong GitHub profile?',
  ];

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">🤖 EduBot</h1>
        <p className="page-subtitle">Your AI-powered study companion — ask anything!</p>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role}`}>
              <div className={`chat-avatar ${msg.role === 'user' ? 'user-av' : 'bot-av'}`}>
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="chat-bubble">{msg.content}</div>
            </div>
          ))}
          {sending && (
            <div className="chat-message assistant">
              <div className="chat-avatar bot-av">🤖</div>
              <div className="chat-bubble" style={{ color: 'var(--text2)' }}>
                Thinking<span className="loader-dots"></span>
              </div>
            </div>
          )}
          <div ref={bottomRef}></div>
        </div>

        {/* Quick suggestions */}
        {messages.length <= 1 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setInput(s)}
                style={{
                  padding: '8px 14px',
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 20,
                  color: 'var(--text2)',
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.target.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.target.style.borderColor = 'var(--border)'}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={sendMessage} className="chat-input-area">
          <textarea
            className="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask EduBot anything..."
            rows={2}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(e);
              }
            }}
          />
          <button type="submit" className="btn btn-primary" disabled={sending || !input.trim()} style={{ width: 'auto', alignSelf: 'flex-end' }}>
            Send →
          </button>
        </form>
      </div>
    </Layout>
  );
}
