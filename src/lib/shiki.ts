import { createHighlighter, type Highlighter } from 'shiki';

const LANG_ALIASES: Record<string, string> = {
    sh: 'bash',
    shell: 'bash',
    zsh: 'bash',
    yml: 'yaml',
    js: 'javascript',
    ts: 'typescript',
    golang: 'go',
    env: 'bash',
};

const SUPPORTED_LANGS = ['json', 'yaml', 'go', 'bash', 'javascript', 'typescript'] as const;

export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

let highlighterPromise: Promise<Highlighter> | null = null;

function loadHighlighter(): Promise<Highlighter> {
    if (!highlighterPromise) {
        highlighterPromise = createHighlighter({
            themes: ['github-light', 'github-dark'],
            langs: [...SUPPORTED_LANGS],
        });
    }
    return highlighterPromise;
}

export function normalizeHighlightLang(language?: string): SupportedLang | null {
    if (!language) {
        return null;
    }
    const lower = language.toLowerCase().trim();
    const mapped = (LANG_ALIASES[lower] ?? lower) as string;
    if ((SUPPORTED_LANGS as readonly string[]).includes(mapped)) {
        return mapped as SupportedLang;
    }
    return null;
}

export async function highlightCode(code: string, language: SupportedLang): Promise<string> {
    const highlighter = await loadHighlighter();
    return highlighter.codeToHtml(code, {
        lang: language,
        themes: {
            light: 'github-light',
            dark: 'github-dark',
        },
        defaultColor: false,
    });
}
