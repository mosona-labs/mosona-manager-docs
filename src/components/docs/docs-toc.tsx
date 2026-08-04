import type { DocHeading } from '@/lib/docs';

import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

type DocsTocProps = {
    headings: DocHeading[];
    label?: string;
};

export function DocsToc({ headings, label = 'On this page' }: DocsTocProps) {
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        if (headings.length === 0) {
            return;
        }

        const elements = headings
            .map((heading) => document.getElementById(heading.id))
            .filter((element): element is HTMLElement => element !== null);

        if (elements.length === 0) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                if (visible[0]?.target.id) {
                    setActiveId(visible[0].target.id);
                }
            },
            { rootMargin: '-20% 0px -70% 0px', threshold: [0, 1] }
        );

        for (const element of elements) {
            observer.observe(element);
        }

        return () => observer.disconnect();
    }, [headings]);

    if (headings.length === 0) {
        return null;
    }

    return (
        <nav aria-label={label} className='text-sm'>
            <p className='mb-3 font-medium text-foreground'>{label}</p>
            <ul className='space-y-1 border-l border-border pl-3'>
                {headings.map((heading) => (
                    <li key={heading.id}>
                        <a
                            href={`#${heading.id}`}
                            className={cn(
                                'block py-0.5 text-muted-foreground transition-colors hover:text-foreground',
                                heading.level === 3 && 'pl-3 text-xs',
                                activeId === heading.id && 'font-medium text-foreground'
                            )}
                        >
                            {heading.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
