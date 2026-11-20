import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import '@fontsource/patrick-hand/latin-400.css';
import '@fontsource/gaegu/latin-400.css';
import '@fontsource/gaegu/latin-700.css';
import './i18n';
import './styles.css';
import App from './App';

registerSW({ immediate: true });

const host = document.getElementById('root');
if (!host) throw new Error('Our Home could not find its front door.');

createRoot(host).render(<App />);
