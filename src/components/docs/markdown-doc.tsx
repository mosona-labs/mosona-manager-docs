import type { ReactNode } from 'react';
import type { Components } from 'react-markdown';

import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

import { CollapsibleCodeBlock } from '@/components/docs/collapsible-code-block';
import { cn } from '@/lib/utils';

type MarkdownDocProps = {
    content: string;
    className?: string;
    /** Rendered once, immediately after the document h1. */
    afterTitle?: ReactNode;
};

function resolveDocHref(href: string | undefined): string | undefined {
    if (!href) {
        return href;
    }
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('#')) {
        return href;
    }
    const mdMatch = href.match(/^(?:\.\/)?([^/]+\.md|index\.md)$/);
    if (mdMatch) {
        const file = mdMatch[1].replace(/\.md$/, '');
        if (file === 'index') {
            return '/docs';
        }
        return `/docs/${file}`;
    }
    const relativeMd = href.match(/^\.\/(.+)\.md$/);
    if (relativeMd?.[1]) {
        return `/docs/${relativeMd[1]}`;
    }
    return href;
}

function parseLanguage(className?: string): string | undefined {
    if (!className) {
        return undefined;
    }
    const match = className.match(/language-([\w-]+)/);
    return match?.[1];
}

function buildComponents(afterTitle?: ReactNode): Components {
    let titleSlotRendered = false;

    return {
        h1: ({ children, id, ...props }) => {
            const showSlot = Boolean(afterTitle) && !titleSlotRendered;
            if (showSlot) {
                titleSlotRendered = true;
            }
            return (
                <>
                    <h1
                        id={id}
                        {...props}
                        className='mb-6 scroll-mt-24 font-semibold text-3xl tracking-tight'
                    >
                        {children}
                    </h1>
                    {showSlot ? afterTitle : null}
                </>
            );
        },
        h2: ({ children, id, ...props }) => (
            <h2
                id={id}
                {...props}
                className='mt-8 mb-3 scroll-mt-24 font-semibold text-xl tracking-tight first:mt-0'
            >
                {children}
            </h2>
        ),
        h3: ({ children, id, ...props }) => (
            <h3
                id={id}
                {...props}
                className='mt-8 mb-3 scroll-mt-24 font-semibold text-base tracking-tight'
            >
                {children}
            </h3>
        ),
        h4: ({ children, id, ...props }) => (
            <h4
                id={id}
                {...props}
                className='mt-4 mb-3 scroll-mt-24 font-semibold text-sm tracking-tight'
            >
                {children}
            </h4>
        ),
        p: ({ children }) => <p className='mb-4 leading-7 text-muted-foreground'>{children}</p>,
        ul: ({ children }) => (
            <ul className='mb-4 list-disc space-y-2 pl-6 text-muted-foreground'>{children}</ul>
        ),
        ol: ({ children }) => (
            <ol className='mb-4 list-decimal space-y-2 pl-6 text-muted-foreground'>{children}</ol>
        ),
        li: ({ children }) => <li className='leading-7'>{children}</li>,
        a: ({ href, children }) => {
            const resolved = resolveDocHref(href);
            const className =
                'font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground';
            if (resolved?.startsWith('/')) {
                return (
                    <Link to={resolved} className={className}>
                        {children}
                    </Link>
                );
            }
            return (
                <a href={resolved} className={className}>
                    {children}
                </a>
            );
        },
        blockquote: ({ children }) => (
            <blockquote className='my-4 border-l-2 border-primary/40 pl-4 text-muted-foreground italic'>
                {children}
            </blockquote>
        ),
        table: ({ children }) => (
            <div className='my-6 overflow-x-auto'>
                <table className='w-full border-collapse text-sm'>{children}</table>
            </div>
        ),
        th: ({ children }) => (
            <th className='border border-border bg-muted/50 px-3 py-2 text-left font-medium'>
                {children}
            </th>
        ),
        td: ({ children }) => (
            <td className='border border-border px-3 py-2 text-muted-foreground'>{children}</td>
        ),
        hr: () => <hr className='my-8 border-border' />,
        img: ({ src, alt, className, style, ...props }) => (
            <img
                src={src}
                alt={alt ?? ''}
                style={style}
                className={cn('my-4 h-auto max-w-full rounded-md', className)}
                loading='lazy'
                {...props}
            />
        ),
        code: ({ className, children }) => {
            const isBlock = Boolean(className?.includes('language-'));
            if (isBlock) {
                return (
                    <CollapsibleCodeBlock language={parseLanguage(className)}>
                        {String(children)}
                    </CollapsibleCodeBlock>
                );
            }
            return (
                <code className='rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground'>
                    {children}
                </code>
            );
        },
        pre: ({ children }) => <>{children}</>,
    };
}

export function MarkdownDoc({ content, className, afterTitle }: MarkdownDocProps) {
    const components = useMemo(() => buildComponents(afterTitle), [afterTitle]);

    return (
        <article className={cn('docs-prose min-w-0', className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[
                    rehypeRaw,
                    rehypeSlug,
                    [
                        rehypeAutolinkHeadings,
                        {
                            behavior: 'wrap',
                            properties: { className: ['anchor-link'] },
                        },
                    ],
                ]}
                components={components}
            >
                {content}
            </ReactMarkdown>
        </article>
    );
}
