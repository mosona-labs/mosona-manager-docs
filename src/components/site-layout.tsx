import { Outlet } from 'react-router-dom';

import { ScrollToTop } from '@/components/scroll-to-top';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export function SiteLayout() {
    return (
        <div className='flex min-h-svh flex-col'>
            <ScrollToTop />
            <SiteHeader />
            <main className='flex-1'>
                <Outlet />
            </main>
            <SiteFooter />
        </div>
    );
}
