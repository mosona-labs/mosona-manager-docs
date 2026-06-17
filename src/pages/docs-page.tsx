import { Link, useParams } from 'react-router-dom';

import { DocsSidebarNav } from '@/components/docs/docs-sidebar-nav';
import { DocsToc } from '@/components/docs/docs-toc';
import { MarkdownDoc } from '@/components/docs/markdown-doc';
import { usePageSeo } from '@/hooks/use-page-seo';
import { docNav, docNavSections, getDocBySlug } from '@/lib/docs';
import { SEO } from '@/lib/seo';
import { cn } from '@/lib/utils';

export function DocsPage() {
    const { '*': slugSplat } = useParams();
    const docSlug = slugSplat?.replace(/\/$/, '') ?? '';
    const doc = getDocBySlug(docSlug);
    const docPath = docSlug === '' ? '/docs' : `/docs/${docSlug}`;

    usePageSeo(
        doc
            ? {
                  title: SEO.titleTemplate(doc.title),
                  description: `${doc.title} — Mosona Manager documentation.`,
                  path: docPath,
              }
            : {
                  title: SEO.titleTemplate('Not found'),
                  description: SEO.description,
                  path: docPath,
                  noindex: true,
              }
    );

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
                    <div className='sticky top-20'>
                        <DocsSidebarNav sections={docNavSections} activeSlug={doc.slug} />
                    </div>
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
