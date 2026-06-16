import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { DocsToc } from '@/components/docs/docs-toc';
import { MarkdownDoc } from '@/components/docs/markdown-doc';
import { docNav, getDocBySlug } from '@/lib/docs';
import { cn } from '@/lib/utils';

export function DocsPage() {
    const { slug } = useParams();
    const docSlug = slug ?? '';
    const doc = getDocBySlug(docSlug);

    useEffect(() => {
        if (!doc) {
            return;
        }
        document.title = `${doc.title} · Mosona Manager`;
    }, [doc]);

    if (!doc) {
        return (
            <div className='mx-auto max-w-3xl px-4 py-20 text-center sm:px-6'>
                <h1 className='font-semibold text-2xl'>Page not found</h1>
                <p className='mt-2 text-muted-foreground'>
                    This documentation page does not exist.
                </p>
                <Link to='/docs' className='mt-6 inline-block text-sm font-medium underline'>
                    Back to docs
                </Link>
            </div>
        );
    }

    return (
        <div className='mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-12'>
            <div className='grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)_200px]'>
                <aside className='hidden lg:block'>
                    <nav aria-label='Documentation' className='sticky top-20 text-sm'>
                        <p className='mb-3 font-medium'>Docs</p>
                        <ul className='space-y-1'>
                            {docNav.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        to={item.href}
                                        className={cn(
                                            'block rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                                            item.slug === doc.slug &&
                                                'bg-muted font-medium text-foreground'
                                        )}
                                    >
                                        {item.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>

                <div className='min-w-0'>
                    <nav
                        className='mb-6 flex flex-wrap gap-2 lg:hidden'
                        aria-label='Documentation mobile'
                    >
                        {docNav.map((item) => (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    'rounded-full border border-border px-3 py-1 text-xs',
                                    item.slug === doc.slug && 'bg-foreground text-background'
                                )}
                            >
                                {item.title}
                            </Link>
                        ))}
                    </nav>
                    <MarkdownDoc content={doc.content} />
                </div>

                <aside className='hidden xl:block'>
                    <div className='sticky top-20'>
                        <DocsToc headings={doc.headings} />
                    </div>
                </aside>
            </div>
        </div>
    );
}
