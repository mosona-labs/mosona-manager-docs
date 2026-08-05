import { SquarePen } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import { DocsMobileNav } from '@/components/docs/docs-mobile-nav';
import { DocsSidebarNav } from '@/components/docs/docs-sidebar-nav';
import { DocsToc } from '@/components/docs/docs-toc';
import { MarkdownDoc } from '@/components/docs/markdown-doc';
import { MissingTranslationCard } from '@/components/docs/missing-translation-card';
import { useLocale } from '@/components/locale-provider';
import { Button } from '@/components/ui/button';
import { usePageSeo } from '@/hooks/use-page-seo';
import { buildDocNavSections, getDocBySlug, getDocEditUrl } from '@/lib/docs';
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
    const editUrl = getDocEditUrl(doc.sourcePath);

    // Sidebars float on their own under the header and must not share the article's
    // vertical padding; otherwise the first screen clips the panel bottom.
    const stickyPanelClassName = cn(
        'sticky top-14 max-h-[calc(100svh-3.5rem)] overflow-y-auto overscroll-none py-6',
        '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
    );

    return (
        <div className='mx-auto max-w-6xl px-4 sm:px-6'>
            <div className='grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)_200px]'>
                <aside className='hidden min-h-0 lg:block'>
                    <div className={cn(stickyPanelClassName, 'pr-2')}>
                        <DocsSidebarNav sections={docNavSections} activeSlug={doc.slug} />
                    </div>
                </aside>

                <div className='min-w-0 py-6 lg:py-12'>
                    <DocsMobileNav
                        key={doc.slug}
                        sections={docNavSections}
                        activeSlug={doc.slug}
                        currentTitle={doc.title}
                        openLabel={messages.docs.openSidebar}
                        closeLabel={messages.docs.closeSidebar}
                    />
                    <MarkdownDoc content={doc.content} afterTitle={afterTitle} />
                    {editUrl ? (
                        <div className='mt-6 pt-4 border-t flex justify-end'>
                            <Button variant='link' className='h-auto px-0' asChild>
                                <a href={editUrl} target='_blank' rel='noreferrer'>
                                    <SquarePen data-icon='inline-start' />
                                    {messages.docs.editThisPage}
                                </a>
                            </Button>
                        </div>
                    ) : null}
                </div>

                <aside className='hidden min-h-0 xl:block'>
                    <div className={cn(stickyPanelClassName, 'pl-1')}>
                        <DocsToc headings={doc.headings} label={messages.docs.onThisPage} />
                    </div>
                </aside>
            </div>
        </div>
    );
}
