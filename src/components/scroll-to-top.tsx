import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Restore scroll position on client-side navigations.
 * - No hash: jump to top
 * - With hash: scroll to the matching element once it exists
 */
export function ScrollToTop() {
    const location = useLocation();

    useLayoutEffect(() => {
        const { hash } = location;

        if (!hash) {
            window.scrollTo({ top: 0, left: 0 });
            return;
        }

        const id = decodeURIComponent(hash.replace(/^#/, ''));
        if (!id) {
            window.scrollTo({ top: 0, left: 0 });
            return;
        }

        const scrollToHash = () => {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView();
                return true;
            }
            return false;
        };

        if (scrollToHash()) {
            return;
        }

        // Content may paint one frame later (e.g. markdown headings).
        const frame = window.requestAnimationFrame(() => {
            if (!scrollToHash()) {
                window.scrollTo({ top: 0, left: 0 });
            }
        });

        return () => window.cancelAnimationFrame(frame);
    }, [location]);

    return null;
}
