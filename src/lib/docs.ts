import GithubSlugger from 'github-slugger';
import YAML from 'yaml';

import navYamlRaw from '../../docs/nav.yaml?raw';

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

const docModules = import.meta.glob('../../docs/*.md', {
    eager: true,
    query: '?raw',
    import: 'default',
}) as Record<string, string>;

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

function slugFromPath(path: string): string {
    const name = path.split('/').pop()?.replace(/\.md$/, '') ?? 'index';
    return name === 'index' ? '' : name;
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
    return Object.entries(docModules).map(([path, content]) => {
        const slug = slugFromPath(path);
        return {
            slug,
            title: titleFromMarkdown(content, slug),
            content,
            headings: extractHeadings(content),
        };
    });
}

function entryToNavItem(entry: DocEntry): DocNavItem {
    return {
        slug: entry.slug,
        title: entry.title,
        href: slugToHref(entry.slug),
    };
}

function buildDocNavSections(allDocs: DocEntry[]): DocNavSection[] {
    const bySlug = new Map(allDocs.map((doc) => [doc.slug, doc]));
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
            const doc = bySlug.get(slug);
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
            sections.push({
                title: section.title?.trim() || 'Docs',
                items,
            });
        }
    }

    const remaining = allDocs
        .filter((doc) => !used.has(doc.slug))
        .sort((a, b) => a.title.localeCompare(b.title))
        .map(entryToNavItem);

    if (remaining.length > 0) {
        sections.push({
            title: 'More',
            items: remaining,
        });
    }

    if (sections.length === 0) {
        return [
            {
                title: 'Docs',
                items: [...allDocs]
                    .sort((a, b) => a.title.localeCompare(b.title))
                    .map(entryToNavItem),
            },
        ];
    }

    return sections;
}

export const docs: DocEntry[] = buildDocs();

export function getDocBySlug(slug: string): DocEntry | undefined {
    return docs.find((doc) => doc.slug === slug);
}

export const docNavSections: DocNavSection[] = buildDocNavSections(docs);

export const docNav: DocNavItem[] = docNavSections.flatMap((section) => section.items);
