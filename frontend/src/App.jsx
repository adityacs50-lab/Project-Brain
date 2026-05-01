import React, { useState, useEffect, useRef } from 'react';
import Message from './components/Message';

const App = () => {
  const [messages, setMessages] = useState([
    { text: "Hi! I'm Company Brain. Ask me anything about our company procedures.", role: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendOk, setBackendOk] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') setBackendOk(true);
      })
      .catch(() => setBackendOk(false));
  }, []);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuery = input;
    setInput('');
    setMessages(prev => [...prev, { text: userQuery, role: 'user' }]);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery }),
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      setMessages(prev => [...prev, { 
        text: data.answer, 
        role: 'bot', 
        sources: data.sources 
      }]);
    } catch (err) {
      setError("Failed to get a response. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#f8f7f4', 
      minHeight: '100vh', 
      fontFamily: 'system-ui, sans-serif',
      color: '#1a1a1a',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{ 
        padding: '24px', 
        borderBottom: '1px solid #e0ddd6', 
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Company Brain 🧠</h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#8c8880' }}>Ask about company procedures</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: backendOk ? '#10b981' : '#ef4444' 
          }} />
          <span style={{ fontSize: '12px' }}>{backendOk ? 'Connected' : 'Offline'}</span>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div style={{ 
          backgroundColor: '#fee2e2', 
          color: '#b91c1c', 
          padding: '12px', 
          textAlign: 'center', 
          fontSize: '14px',
          borderBottom: '1px solid #fecaca'
        }}>
          {error}
        </div>
      )}

      {/* Message List */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '800px',
        width: '100%',
        margin: '0 auto'
      }}>
        {messages.map((m, i) => (
          <Message key={i} text={m.text} role={m.role} sources={m.sources} />
        ))}
        {loading && (
          <div style={{ fontSize: '14px', color: '#8c8880', fontStyle: 'italic', marginBottom: '16px' }}>
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ 
        padding: '24px', 
        backgroundColor: 'white', 
        borderTop: '1px solid #e0ddd6' 
      }}>
        <form onSubmit={handleSend} style={{ 
          maxWidth: '800px', 
          margin: '0 auto',
          display: 'flex',
          gap: '12px'
        }}>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="How do I handle a refund over $200?"
            style={{ 
              flex: 1, 
              padding: '12px 16px', 
              borderRadius: '8px', 
              border: '1px solid #e0ddd6',
              fontSize: '15px',
              outline: 'none'
            }}
          />
          <button 
            type="submit"
            disabled={loading}
            style={{ 
              backgroundColor: '#1a1a1a', 
              color: 'white', 
              border: 'none', 
              padding: '0 24px', 
              borderRadius: '8px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;
