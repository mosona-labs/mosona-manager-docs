import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { SiteLayout } from '@/components/site-layout';
import { DocsPage } from '@/pages/docs-page';
import { HomePage } from '@/pages/home-page';
import { NotFoundPage } from '@/pages/not-found-page';

export function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<SiteLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path='docs/*' element={<DocsPage />} />
                    <Route path='404' element={<NotFoundPage />} />
                    <Route path='*' element={<Navigate to='/404' replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
