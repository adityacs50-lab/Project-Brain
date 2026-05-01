import React from 'react';

const Message = ({ text, role, sources }) => {
  const isUser = role === 'user';
  
  const bubbleStyle = {
    maxWidth: '80%',
    padding: '12px 16px',
    borderRadius: '12px',
    marginBottom: '16px',
    fontSize: '15px',
    lineHeight: '1.5',
    alignSelf: isUser ? 'flex-end' : 'flex-start',
    backgroundColor: isUser ? '#e8e6e0' : 'white',
    color: '#1a1a1a',
    border: isUser ? 'none' : '1px solid #e0ddd6',
    boxShadow: isUser ? 'none' : '0 2px 4px rgba(0,0,0,0.02)'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
      <div style={bubbleStyle}>
        <div>{text}</div>
        {!isUser && sources && sources.length > 0 && (
          <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #f0efeb', fontSize: '12px', color: '#8c8880' }}>
            <strong>Sources:</strong> {sources.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
