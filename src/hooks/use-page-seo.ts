import { useEffect } from 'react';

import { applyPageSeo } from '@/lib/seo';

type UsePageSeoOptions = {
    title?: string;
    description?: string;
    path?: string;
    image?: string;
    imageAlt?: string;
    noindex?: boolean;
};

export function usePageSeo({
    title,
    description,
    path,
    image,
    imageAlt,
    noindex,
}: UsePageSeoOptions = {}): void {
    useEffect(() => {
        applyPageSeo({ title, description, path, image, imageAlt, noindex });
    }, [title, description, path, image, imageAlt, noindex]);
}
