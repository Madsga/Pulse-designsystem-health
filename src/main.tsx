import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { PulseProvider } from './state/PulseContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PulseProvider>
      <App />
    </PulseProvider>
  </StrictMode>,
);
