export const SEO = {
    siteName: 'Mosona Manager',
    defaultTitle: 'Mosona Manager — Server Monitor & SSH Terminal',
    titleTemplate: (page: string) => `${page} · Mosona Manager`,
    description:
        'Team-oriented server monitor and terminal management: project permissions, real-time monitoring, SSH and Mosona Agent, notifications, API, and public status pages.',
    keywords: [
        'Mosona Manager',
        'server monitor',
        'SSH terminal',
        'infrastructure monitoring',
        'Docker',
        'InfluxDB',
        'Postgres',
        'agent',
        'devops',
    ].join(', '),
    author: 'Mosona Labs',
    locale: 'en_US',
    twitterCard: 'summary_large_image',
    themeColorLight: '#ffffff',
    themeColorDark: '#1a1a1a',
    ogImage: '/screenshots/1.jpg',
    ogImageAlt: 'Mosona Manager dashboard overview',
} as const;

export function siteOrigin(): string {
    const fromEnv = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '');
    if (fromEnv) {
        return fromEnv;
    }
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }
    return 'https://manager.mosona.cc';
}

export function absoluteUrl(path: string): string {
    const base = siteOrigin();
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalized}`;
}

type PageSeoInput = {
    title?: string;
    description?: string;
    path?: string;
    image?: string;
    imageAlt?: string;
    noindex?: boolean;
};

function upsertMeta(selector: string, attributes: Record<string, string>, content: string): void {
    let el = document.head.querySelector<HTMLMetaElement>(selector);
    if (!el) {
        el = document.createElement('meta');
        for (const [key, value] of Object.entries(attributes)) {
            el.setAttribute(key, value);
        }
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string): void {
    let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
    }
    el.setAttribute('href', href);
}

export function applyPageSeo(input: PageSeoInput = {}): void {
    const title = input.title ?? SEO.defaultTitle;
    const description = input.description ?? SEO.description;
    const path = input.path ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
    const url = absoluteUrl(path);
    const image = input.image ?? SEO.ogImage;
    const imageAlt = input.imageAlt ?? SEO.ogImageAlt;
    const robots = input.noindex ? 'noindex, nofollow' : 'index, follow';

    document.title = title;

    upsertMeta('meta[name="description"]', { name: 'description' }, description);
    upsertMeta('meta[name="robots"]', { name: 'robots' }, robots);

    upsertMeta('meta[property="og:title"]', { property: 'og:title' }, title);
    upsertMeta('meta[property="og:description"]', { property: 'og:description' }, description);
    upsertMeta('meta[property="og:url"]', { property: 'og:url' }, url);
    upsertMeta('meta[property="og:image"]', { property: 'og:image' }, image);
    upsertMeta('meta[property="og:image:alt"]', { property: 'og:image:alt' }, imageAlt);
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name' }, SEO.siteName);
    upsertMeta('meta[property="og:type"]', { property: 'og:type' }, 'website');
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale' }, SEO.locale);

    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, SEO.twitterCard);
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, title);
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, description);
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, image);
    upsertMeta('meta[name="twitter:image:alt"]', { name: 'twitter:image:alt' }, imageAlt);

    upsertLink('canonical', url);
}
