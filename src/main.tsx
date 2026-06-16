import { createRoot } from 'react-dom/client';

import './index.css';
import { ThemeProvider } from '@/components/theme-provider.tsx';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
    <ThemeProvider>
        <App />
    </ThemeProvider>
);
