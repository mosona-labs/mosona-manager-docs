import { createRoot } from 'react-dom/client';

import './index.css';

import App from './App.tsx';
import { LocaleProvider } from '@/components/locale-provider.tsx';
import { ThemeProvider } from '@/components/theme-provider.tsx';

createRoot(document.getElementById('root')!).render(
    <ThemeProvider>
        <LocaleProvider>
            <App />
        </LocaleProvider>
    </ThemeProvider>
);
