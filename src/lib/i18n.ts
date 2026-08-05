import configJson from '../../config.json';

export type LocaleCode = string;

export type LocaleMeta = {
    name: string;
    nativeName: string;
};

export type ScreenshotCopy = {
    title: string;
    description: string;
};

export type Messages = {
    nav: {
        home: string;
        docs: string;
    };
    header: {
        siteName: string;
        github: string;
        toggleTheme: string;
        openMenu: string;
        closeMenu: string;
    };
    home: {
        badge: string;
        titleBrand: string;
        titleRest: string;
        description: string;
        getStarted: string;
        viewOnGithub: string;
        heroImageAlt: string;
        introTitle: string;
        introDescription: string;
        deployTitle: string;
        deployDescription: string;
        openQuickstart: string;
        screenshots: ScreenshotCopy[];
    };
    footer: {
        github: string;
        discord: string;
        discussions: string;
    };
    docs: {
        pageNotFoundTitle: string;
        pageNotFoundDescription: string;
        backToDocs: string;
        onThisPage: string;
        openSidebar: string;
        closeSidebar: string;
        missingTranslationTitle: string;
        missingTranslationDescription: string;
        readOriginal: string;
        otherTranslations: string;
        docDescription: string;
        navSections: Record<string, string>;
    };
    notFound: {
        title: string;
        backHome: string;
    };
    language: {
        label: string;
        select: string;
    };
    seo: {
        defaultTitle: string;
        description: string;
    };
};

export type SiteConfig = {
    defaultLocale: LocaleCode;
    locales: Record<LocaleCode, LocaleMeta>;
    messages: Record<LocaleCode, Messages>;
};

export const siteConfig = configJson as SiteConfig;

export const defaultLocale: LocaleCode = siteConfig.defaultLocale;

export const localeCodes: LocaleCode[] = Object.keys(siteConfig.locales);

export const localeList = localeCodes.map((code) => ({
    code,
    ...siteConfig.locales[code],
}));

const localeSet = new Set(localeCodes);

export function isLocaleCode(value: string | null | undefined): value is LocaleCode {
    return Boolean(value && localeSet.has(value));
}

export function getLocaleMeta(locale: LocaleCode): LocaleMeta {
    return siteConfig.locales[locale] ?? siteConfig.locales[defaultLocale];
}

export function getMessages(locale: LocaleCode): Messages {
    return siteConfig.messages[locale] ?? siteConfig.messages[defaultLocale];
}

/** Replace `{name}` placeholders in a message template. */
export function formatMessage(template: string, vars: Record<string, string>): string {
    return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`);
}

function pickFirstAvailable(
    preferred: LocaleCode[],
    supported: LocaleCode[]
): LocaleCode | undefined {
    const set = new Set(supported.map((code) => code.toLowerCase()));
    for (const code of preferred) {
        const hit = supported.find((item) => item.toLowerCase() === code.toLowerCase());
        if (hit && set.has(hit.toLowerCase())) {
            return hit;
        }
    }
    return undefined;
}

/** Map loose browser tags (especially Chinese variants) onto configured locales. */
function resolveLooseLocale(tag: string, supported: LocaleCode[]): LocaleCode | undefined {
    const lower = tag.toLowerCase();
    const parts = lower.split('-');
    const base = parts[0];

    if (base === 'zh') {
        const rest = parts.slice(1);
        const isHans =
            rest.includes('cn') ||
            rest.includes('sg') ||
            rest.includes('hans') ||
            rest.includes('my');
        const isHant =
            rest.includes('hk') ||
            rest.includes('tw') ||
            rest.includes('mo') ||
            rest.includes('hant');

        if (isHant && !isHans) {
            return pickFirstAvailable(['zh-HK', 'zh-TW', 'zh-MO', 'zh-Hant'], supported);
        }
        if (isHans || rest.length === 0) {
            return pickFirstAvailable(['zh-CN', 'zh-SG', 'zh-Hans', 'zh'], supported);
        }
        // Unknown zh-* region: prefer exact-ish traditional/simplified by region codes already handled.
        return pickFirstAvailable(['zh-CN', 'zh-HK', 'zh'], supported);
    }

    // Generic prefix: en-US → en, pt-BR → pt-BR then pt
    const exactRegion = supported.find((code) => code.toLowerCase() === lower);
    if (exactRegion) {
        return exactRegion;
    }
    return supported.find((code) => {
        const c = code.toLowerCase();
        return c === base || c.startsWith(`${base}-`);
    });
}

/**
 * Pick the best supported locale from the browser language list.
 * Prefers exact matches, then language-family heuristics (e.g. `zh-TW` → `zh-HK`).
 */
export function detectBrowserLocale(
    supported: LocaleCode[] = localeCodes,
    fallback: LocaleCode = defaultLocale
): LocaleCode {
    if (typeof navigator === 'undefined') {
        return fallback;
    }

    const candidates = navigator.languages?.length
        ? [...navigator.languages]
        : navigator.language
          ? [navigator.language]
          : [];

    for (const raw of candidates) {
        const lang = raw.trim();
        if (!lang) {
            continue;
        }
        const exact = supported.find((code) => code.toLowerCase() === lang.toLowerCase());
        if (exact) {
            return exact;
        }
    }

    for (const raw of candidates) {
        const lang = raw.trim();
        if (!lang) {
            continue;
        }
        const resolved = resolveLooseLocale(lang, supported);
        if (resolved) {
            return resolved;
        }
    }

    return fallback;
}

export function isLocaleDirectoryName(name: string): boolean {
    return name !== defaultLocale && localeSet.has(name);
}
