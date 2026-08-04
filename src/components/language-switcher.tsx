import { Check, Languages } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import { useLocale } from '@/components/locale-provider';
import { Button } from '@/components/ui/button';
import { localeList } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type LanguageSwitcherProps = {
    className?: string;
    /** Compact icon-only trigger (header). */
    compact?: boolean;
};

export function LanguageSwitcher({ className, compact = true }: LanguageSwitcherProps) {
    const { locale, setLocale, messages } = useLocale();
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const menuId = useId();

    useEffect(() => {
        if (!open) {
            return;
        }
        const onPointerDown = (event: MouseEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };
        window.addEventListener('mousedown', onPointerDown);
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('mousedown', onPointerDown);
            window.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const current = localeList.find((item) => item.code === locale);

    return (
        <div ref={rootRef} className={cn('relative', className)}>
            <Button
                type='button'
                variant='ghost'
                size={compact ? 'icon-sm' : 'sm'}
                aria-label={messages.language.select}
                aria-haspopup='listbox'
                aria-expanded={open}
                aria-controls={menuId}
                onClick={() => setOpen((value) => !value)}
            >
                <Languages className='size-4' />
                {!compact ? (
                    <span className='max-w-24 truncate'>{current?.nativeName ?? locale}</span>
                ) : null}
            </Button>

            {open ? (
                <div
                    id={menuId}
                    role='listbox'
                    aria-label={messages.language.label}
                    className='absolute top-full right-0 z-50 mt-1 min-w-40 overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md'
                >
                    {localeList.map((item) => {
                        const selected = item.code === locale;
                        return (
                            <button
                                key={item.code}
                                type='button'
                                role='option'
                                aria-selected={selected}
                                className={cn(
                                    'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted',
                                    selected && 'bg-muted font-medium'
                                )}
                                onClick={() => {
                                    setLocale(item.code);
                                    setOpen(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                        'size-3.5 shrink-0',
                                        selected ? 'opacity-100' : 'opacity-0'
                                    )}
                                />
                                <span className='flex min-w-0 flex-col'>
                                    <span className='truncate'>{item.nativeName}</span>
                                    {item.nativeName !== item.name ? (
                                        <span className='truncate text-xs text-muted-foreground'>
                                            {item.name}
                                        </span>
                                    ) : null}
                                </span>
                            </button>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}
