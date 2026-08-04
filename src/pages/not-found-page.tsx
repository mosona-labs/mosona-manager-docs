import { Link } from 'react-router-dom';

import { useLocale } from '@/components/locale-provider';
import { Button } from '@/components/ui/button';
import { usePageSeo } from '@/hooks/use-page-seo';
import { SEO } from '@/lib/seo';

export function NotFoundPage() {
    const { messages } = useLocale();

    usePageSeo({
        title: SEO.titleTemplate(messages.notFound.title),
        description: messages.seo.description || SEO.description,
        path: '/404',
        noindex: true,
    });

    return (
        <div className='mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6'>
            <p className='font-mono text-sm text-muted-foreground'>404</p>
            <h1 className='mt-2 font-semibold text-2xl'>{messages.notFound.title}</h1>
            <Button asChild className='mt-8'>
                <Link to='/'>{messages.notFound.backHome}</Link>
            </Button>
        </div>
    );
}
