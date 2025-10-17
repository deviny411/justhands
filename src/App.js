import React from 'react';
import HandTracking from './components/HandTracking';

function App() {
  const lyrics = [
    { time: 0, text: 'hello', aslSign: 'hello' },
    { time: 5, text: 'world', aslSign: 'world' },
    { time: 10, text: 'learn', aslSign: 'learn' },
    { time: 15, text: 'asl', aslSign: 'asl' }
  ];

  return (
    <div>
      <h1>justhands - ASL Learning Demo</h1>
      <div style={{ marginBottom: 20 }}>
        <h3>Song Lyrics</h3>
        <p>
          {lyrics.map(word => (
            <span
              key={word.time}
              style={{ fontWeight: 'bold', marginRight: 10, cursor: 'pointer' }}
              title={`ASL Sign: ${word.aslSign}`}
            >
              {word.text}
            </span>
          ))}
        </p>
      </div>
      <HandTracking />
    </div>
  );
}

export default App;
