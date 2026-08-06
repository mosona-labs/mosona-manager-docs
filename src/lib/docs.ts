import GithubSlugger from 'github-slugger';
import YAML from 'yaml';

import navYamlRaw from '../../docs/nav.yaml?raw';
import {
    defaultLocale,
    isLocaleDirectoryName,
    type LocaleCode,
    localeCodes,
    siteConfig,
} from '@/lib/i18n';

export type DocHeading = {
    id: string;
    text: string;
    level: 2 | 3;
};

export type DocEntry = {
    slug: string;
    title: string;
    content: string;
    headings: DocHeading[];
    locale: LocaleCode;
    /** Path relative to the docs root, e.g. `index.md` or `zh-CN/quickstart.md`. */
    sourcePath: string;
};

export type ResolvedDoc = DocEntry & {
    /** True when content falls back to the default-locale copy. */
    isFallback: boolean;
    /** Locales that have a real copy of this slug (always includes default if the page exists). */
    availableLocales: LocaleCode[];
};

export type DocNavItem = {
    slug: string;
    title: string;
    href: string;
};

export type DocNavSection = {
    title: string;
    items: DocNavItem[];
};

type NavYaml = {
    sections?: {
        title: string;
        items: string[];
    }[];
};

const docModules = import.meta.glob('../../docs/**/*.md', {
    eager: true,
    query: '?raw',
    import: 'default',
}) as Record<string, string>;

const DOCS_ROOT = '../../docs/';

function navIdToSlug(id: string): string {
    const trimmed = id.trim();
    if (trimmed === 'index') {
        return '';
    }
    return trimmed.replace(/\.md$/i, '');
}

function slugToHref(slug: string): string {
    return slug === '' ? '/docs' : `/docs/${slug}`;
}

function toSourcePath(path: string): string {
    return path.startsWith(DOCS_ROOT) ? path.slice(DOCS_ROOT.length) : path;
}

function parseDocPath(
    path: string
): { locale: LocaleCode; slug: string; sourcePath: string } | null {
    const relative = toSourcePath(path);
    if (!relative.toLowerCase().endsWith('.md')) {
        return null;
    }

    const withoutExt = relative.replace(/\.md$/i, '');
    const parts = withoutExt.split('/');
    if (parts.length === 0 || parts.some((part) => part === '')) {
        return null;
    }

    let locale: LocaleCode = defaultLocale;
    let slugParts = parts;

    if (isLocaleDirectoryName(parts[0])) {
        locale = parts[0];
        slugParts = parts.slice(1);
        if (slugParts.length === 0) {
            return null;
        }
    }

    // Guard: a path segment that looks like a locale dir deeper in the tree is fine as content.
    let slug = slugParts.join('/');
    if (slug === 'index') {
        slug = '';
    }

    return { locale, slug, sourcePath: relative };
}

function trimSlashes(value: string): string {
    return value.replace(/^\/+|\/+$/g, '');
}

/** Build a GitHub blob URL for a docs source file, or `undefined` when not configured. */
export function getDocEditUrl(sourcePath: string): string | undefined {
    const config = siteConfig.docsGithub;
    const repository = config?.repository?.trim();
    if (!config || !repository || !sourcePath) {
        return undefined;
    }

    const branch = trimSlashes(config.branch?.trim() || 'main');
    const directory = trimSlashes(config.directory?.trim() || 'docs');
    const base = repository.replace(/\/+$/g, '');
    const filePath = trimSlashes(sourcePath);

    return `${base}/blob/${branch}/${directory}/${filePath}`;
}

function titleFromMarkdown(content: string, slug: string): string {
    const match = content.match(/^#\s+(.+)$/m);
    if (match?.[1]) {
        return match[1].trim();
    }
    if (slug === '') {
        return 'Documentation';
    }
    return slug
        .split('/')
        .pop()!
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

export function extractHeadings(markdown: string): DocHeading[] {
    const slugger = new GithubSlugger();
    const headings: DocHeading[] = [];
    const lines = markdown.split('\n');

    for (const line of lines) {
        const h2 = line.match(/^##\s+(.+)$/);
        if (h2?.[1]) {
            const text = h2[1].trim();
            headings.push({ level: 2, text, id: slugger.slug(text) });
            continue;
        }
        const h3 = line.match(/^###\s+(.+)$/);
        if (h3?.[1]) {
            const text = h3[1].trim();
            headings.push({ level: 3, text, id: slugger.slug(text) });
        }
    }

    return headings;
}

function buildDocs(): DocEntry[] {
    const entries: DocEntry[] = [];

    for (const [path, content] of Object.entries(docModules)) {
        const parsed = parseDocPath(path);
        if (!parsed) {
            continue;
        }
        // Only accept locale folders declared in config (default lives at docs root).
        if (parsed.locale !== defaultLocale && !localeCodes.includes(parsed.locale)) {
            continue;
        }
        entries.push({
            slug: parsed.slug,
            locale: parsed.locale,
            sourcePath: parsed.sourcePath,
            title: titleFromMarkdown(content, parsed.slug),
            content,
            headings: extractHeadings(content),
        });
    }

    return entries;
}

export const docs: DocEntry[] = buildDocs();

function docsForLocale(locale: LocaleCode): DocEntry[] {
    return docs.filter((doc) => doc.locale === locale);
}

export function getAvailableLocalesForSlug(slug: string): LocaleCode[] {
    const found = new Set<LocaleCode>();
    for (const doc of docs) {
        if (doc.slug === slug) {
            found.add(doc.locale);
        }
    }
    // Stable order: default first, then config order.
    return localeCodes.filter((code) => found.has(code));
}

export function getDocBySlug(
    slug: string,
    locale: LocaleCode = defaultLocale
): ResolvedDoc | undefined {
    const availableLocales = getAvailableLocalesForSlug(slug);
    if (availableLocales.length === 0) {
        return undefined;
    }

    const localized = docs.find((doc) => doc.slug === slug && doc.locale === locale);
    if (localized) {
        return {
            ...localized,
            isFallback: false,
            availableLocales,
        };
    }

    const fallback =
        docs.find((doc) => doc.slug === slug && doc.locale === defaultLocale) ??
        docs.find((doc) => doc.slug === slug);

    if (!fallback) {
        return undefined;
    }

    return {
        ...fallback,
        isFallback: true,
        availableLocales,
    };
}

function entryToNavItem(entry: DocEntry): DocNavItem {
    return {
        slug: entry.slug,
        title: entry.title,
        href: slugToHref(entry.slug),
    };
}

/**
 * Build sidebar nav for a locale. Item titles prefer the localized doc title,
 * falling back to the default-locale title. Section titles come from nav.yaml
 * and can be remapped by the caller via `translateSectionTitle`.
 */
export function buildDocNavSections(
    locale: LocaleCode = defaultLocale,
    translateSectionTitle: (title: string) => string = (title) => title
): DocNavSection[] {
    const defaultDocs = docsForLocale(defaultLocale);
    const localizedBySlug = new Map(docsForLocale(locale).map((doc) => [doc.slug, doc]));
    const defaultBySlug = new Map(defaultDocs.map((doc) => [doc.slug, doc]));

    // Union of slugs: default docs define the canonical set; orphan localized pages are appended.
    const allSlugs = new Set<string>([
        ...defaultDocs.map((doc) => doc.slug),
        ...docs.filter((doc) => doc.locale === locale).map((doc) => doc.slug),
    ]);

    const resolveEntry = (slug: string): DocEntry | undefined => {
        return localizedBySlug.get(slug) ?? defaultBySlug.get(slug);
    };

    const used = new Set<string>();
    const sections: DocNavSection[] = [];

    let parsed: NavYaml = {};
    try {
        parsed = YAML.parse(navYamlRaw) as NavYaml;
    } catch {
        parsed = {};
    }

    for (const section of parsed.sections ?? []) {
        const items: DocNavItem[] = [];
        for (const id of section.items ?? []) {
            const slug = navIdToSlug(id);
            const doc = resolveEntry(slug);
            if (!doc) {
                if (import.meta.env.DEV) {
                    console.warn(`[docs/nav.yaml] Unknown page id "${id}" (slug "${slug}")`);
                }
                continue;
            }
            if (used.has(slug)) {
                continue;
            }
            used.add(slug);
            items.push(entryToNavItem(doc));
        }
        if (items.length > 0) {
            const rawTitle = section.title?.trim() || 'Docs';
            sections.push({
                title: translateSectionTitle(rawTitle),
                items,
            });
        }
    }

    const remaining = [...allSlugs]
        .filter((slug) => !used.has(slug))
        .map((slug) => resolveEntry(slug))
        .filter((doc): doc is DocEntry => Boolean(doc))
        .sort((a, b) => a.title.localeCompare(b.title))
        .map(entryToNavItem);

    if (remaining.length > 0) {
        sections.push({
            title: translateSectionTitle('More'),
            items: remaining,
        });
    }

    if (sections.length === 0) {
        return [
            {
                title: translateSectionTitle('Docs'),
                items: [...allSlugs]
                    .map((slug) => resolveEntry(slug))
                    .filter((doc): doc is DocEntry => Boolean(doc))
                    .sort((a, b) => a.title.localeCompare(b.title))
                    .map(entryToNavItem),
            },
        ];
    }

    return sections;
}

/** @deprecated Prefer buildDocNavSections(locale) — kept for static default export consumers. */
export const docNavSections: DocNavSection[] = buildDocNavSections(defaultLocale);

export const docNav: DocNavItem[] = docNavSections.flatMap((section) => section.items);
