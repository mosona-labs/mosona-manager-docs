import * as React from 'react';

import {
    defaultLocale,
    detectBrowserLocale,
    getMessages,
    isLocaleCode,
    type LocaleCode,
    type Messages,
} from '@/lib/i18n';

const STORAGE_KEY = 'locale';

type LocaleProviderState = {
    locale: LocaleCode;
    setLocale: (locale: LocaleCode) => void;
    messages: Messages;
    defaultLocale: LocaleCode;
};

const LocaleProviderContext = React.createContext<LocaleProviderState | undefined>(undefined);

function readStoredLocale(): LocaleCode | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return isLocaleCode(stored) ? stored : null;
    } catch {
        return null;
    }
}

function resolveInitialLocale(): LocaleCode {
    const stored = readStoredLocale();
    if (stored) {
        return stored;
    }
    return detectBrowserLocale();
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = React.useState<LocaleCode>(() => resolveInitialLocale());

    const setLocale = React.useCallback((next: LocaleCode) => {
        if (!isLocaleCode(next)) {
            return;
        }
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {
            // ignore quota / private mode
        }
        setLocaleState(next);
    }, []);

    React.useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);

    React.useEffect(() => {
        const onStorage = (event: StorageEvent) => {
            if (event.storageArea !== localStorage || event.key !== STORAGE_KEY) {
                return;
            }
            if (isLocaleCode(event.newValue)) {
                setLocaleState(event.newValue);
                return;
            }
            setLocaleState(defaultLocale);
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const messages = React.useMemo(() => getMessages(locale), [locale]);

    const value = React.useMemo(
        () => ({
            locale,
            setLocale,
            messages,
            defaultLocale,
        }),
        [locale, setLocale, messages]
    );

    return (
        <LocaleProviderContext.Provider value={value}>{children}</LocaleProviderContext.Provider>
    );
}

export function useLocale() {
    const context = React.useContext(LocaleProviderContext);
    if (context === undefined) {
        throw new Error('useLocale must be used within a LocaleProvider');
    }
    return context;
}
