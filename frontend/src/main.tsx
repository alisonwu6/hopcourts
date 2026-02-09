import React from 'react'
// Environment Variable Debugging for Production Check
console.log('%c[ENV Check - 12:39]', 'color: #00ff00; font-weight: bold;', {
  timestamp: new Date().toISOString(),
  MODE: import.meta.env.MODE,
  BASE_URL: import.meta.env.BASE_URL,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  HAS_PUBLISHABLE_KEY: !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
});

import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AppProviders } from './app/providers'

// Prevent zooming on iOS
document.addEventListener('gesturestart', function (e) {
  e.preventDefault();
});
document.addEventListener('gesturechange', function (e) {
  e.preventDefault();
}); 
document.addEventListener('gestureend', function (e) {
  e.preventDefault();
});

// Prevent double-tap zoom
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
  const now = (new Date()).getTime();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, false);

// Prevent pinch-zoom (multi-touch)
document.addEventListener('touchmove', function (event) {
  if (event.touches.length > 1) {
    event.preventDefault();
  }
}, { passive: false });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProviders>
        <App />
      </AppProviders>
    </BrowserRouter>
  </React.StrictMode>
)
