// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Guard against double createRoot (React StrictMode / HMR issue)
const container = document.getElementById('root');

if (!container._reactRoot) {
  container._reactRoot = ReactDOM.createRoot(container);
}

container._reactRoot.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);