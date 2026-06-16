import GithubSlugger from 'github-slugger';

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

const docModules = import.meta.glob('../../docs/*.md', {
    eager: true,
    query: '?raw',
    import: 'default',
}) as Record<string, string>;

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
    const entries = Object.entries(docModules).map(([path, content]) => {
        const slug = slugFromPath(path);
        return {
            slug,
            title: titleFromMarkdown(content, slug),
            content,
            headings: extractHeadings(content),
        };
    });

    entries.sort((a, b) => {
        if (a.slug === '') {
            return -1;
        }
        if (b.slug === '') {
            return 1;
        }
        return a.title.localeCompare(b.title);
    });

    return entries;
}

export const docs: DocEntry[] = buildDocs();

export function getDocBySlug(slug: string): DocEntry | undefined {
    return docs.find((doc) => doc.slug === slug);
}

export const docNav = docs.map((doc) => ({
    slug: doc.slug,
    title: doc.title,
    href: doc.slug === '' ? '/docs' : `/docs/${doc.slug}`,
}));
