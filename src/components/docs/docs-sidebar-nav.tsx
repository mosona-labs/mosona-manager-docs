import type { DocNavSection } from '@/lib/docs';

import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';

type DocsSidebarNavProps = {
    sections: DocNavSection[];
    activeSlug: string;
    className?: string;
};

export function DocsSidebarNav({ sections, activeSlug, className }: DocsSidebarNavProps) {
    return (
        <nav aria-label='Documentation' className={cn('text-sm', className)}>
            <div className='space-y-6'>
                {sections.map((section) => (
                    <div key={section.title}>
                        <p className='mb-2 font-mono text-sm tracking-wider uppercase'>
                            {section.title}
                        </p>
                        <ul className='space-y-0.5'>
                            {section.items.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        to={item.href}
                                        className={cn(
                                            'block rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                                            item.slug === activeSlug &&
                                                'bg-muted font-medium text-foreground'
                                        )}
                                    >
                                        {item.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </nav>
    );
}
