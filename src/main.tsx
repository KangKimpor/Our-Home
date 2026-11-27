import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { AssetPreloader } from './ui/AssetPreloader';
import { OrientationGate } from './ui/OrientationGate';
import { VersionGate } from './ui/VersionGate';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VersionGate>
      <AssetPreloader>
        <OrientationGate>
          <App />
        </OrientationGate>
      </AssetPreloader>
    </VersionGate>
  </StrictMode>,
);
