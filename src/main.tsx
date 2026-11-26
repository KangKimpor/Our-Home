import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { VersionGate } from './ui/VersionGate';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VersionGate>
      <App />
    </VersionGate>
  </StrictMode>,
);
