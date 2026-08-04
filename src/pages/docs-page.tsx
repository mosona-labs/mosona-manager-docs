import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import { DocsSidebarNav } from '@/components/docs/docs-sidebar-nav';
import { DocsToc } from '@/components/docs/docs-toc';
import { MarkdownDoc } from '@/components/docs/markdown-doc';
import { MissingTranslationCard } from '@/components/docs/missing-translation-card';
import { useLocale } from '@/components/locale-provider';
import { usePageSeo } from '@/hooks/use-page-seo';
import { buildDocNavSections, getDocBySlug } from '@/lib/docs';
import { formatMessage } from '@/lib/i18n';
import { SEO } from '@/lib/seo';
import { cn } from '@/lib/utils';

export function DocsPage() {
    const { '*': slugSplat } = useParams();
    const { locale, messages } = useLocale();
    const docSlug = slugSplat?.replace(/\/$/, '') ?? '';
    const doc = getDocBySlug(docSlug, locale);
    const docPath = docSlug === '' ? '/docs' : `/docs/${docSlug}`;

    const docNavSections = useMemo(
        () => buildDocNavSections(locale, (title) => messages.docs.navSections[title] ?? title),
        [locale, messages.docs.navSections]
    );
    const docNav = useMemo(
        () => docNavSections.flatMap((section) => section.items),
        [docNavSections]
    );

    usePageSeo(
        doc
            ? {
                  title: SEO.titleTemplate(doc.title),
                  description: formatMessage(messages.docs.docDescription, { title: doc.title }),
                  path: docPath,
              }
            : {
                  title: SEO.titleTemplate(messages.docs.pageNotFoundTitle),
                  description: messages.seo.description || SEO.description,
                  path: docPath,
                  noindex: true,
              }
    );

    if (!doc) {
        return (
            <div className='mx-auto max-w-3xl px-4 py-20 text-center sm:px-6'>
                <h1 className='font-semibold text-2xl'>{messages.docs.pageNotFoundTitle}</h1>
                <p className='mt-2 text-muted-foreground'>
                    {messages.docs.pageNotFoundDescription}
                </p>
                <Link to='/docs' className='mt-6 inline-block text-sm font-medium underline'>
                    {messages.docs.backToDocs}
                </Link>
            </div>
        );
    }

    const afterTitle = doc.isFallback ? (
        <MissingTranslationCard availableLocales={doc.availableLocales} />
    ) : null;

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
                    <MarkdownDoc content={doc.content} afterTitle={afterTitle} />
                </div>

                <aside className='hidden xl:block'>
                    <div className='sticky top-20'>
                        <DocsToc headings={doc.headings} label={messages.docs.onThisPage} />
                    </div>
                </aside>
            </div>
        </div>
    );
}
