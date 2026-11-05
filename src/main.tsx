import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import 'maplibre-gl/dist/maplibre-gl.css';
import './index.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { ActionHost } from './neon/actions';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary><App /></ErrorBoundary><ActionHost />
      <Toaster position="top-center" richColors closeButton toastOptions={{ style: { fontFamily: 'Outfit, sans-serif' } }} />
    </BrowserRouter>
  </React.StrictMode>
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
}
