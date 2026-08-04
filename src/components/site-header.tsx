import { Menu, Moon, Sun, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { GithubIcon } from './icons';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLocale } from '@/components/locale-provider';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { site } from '@/lib/site-content';
import { cn } from '@/lib/utils';

export function SiteHeader() {
    const { theme, setTheme } = useTheme();
    const { messages } = useLocale();
    const [open, setOpen] = useState(false);

    const nav = useMemo(
        () =>
            [
                { to: '/', label: messages.nav.home },
                { to: '/docs', label: messages.nav.docs },
            ] as const,
        [messages.nav.home, messages.nav.docs]
    );

    useEffect(() => {
        if (!open) {
            return;
        }
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    const [resolved, setResolved] = useState<'dark' | 'light'>('light');

    useEffect(() => {
        const update = () => {
            if (theme === 'system') {
                setResolved(
                    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
                );
                return;
            }
            setResolved(theme);
        };
        update();
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        media.addEventListener('change', update);
        return () => media.removeEventListener('change', update);
    }, [theme]);

    return (
        <header className='sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md'>
            <div className='mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6'>
                <Link to='/' className='font-semibold tracking-tight'>
                    {messages.header.siteName}
                </Link>

                <nav className='hidden items-center gap-1 md:flex flex-1' aria-label='Main'>
                    {nav.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                            className={({ isActive }) =>
                                cn(
                                    'rounded-md px-3 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground',
                                    isActive && 'bg-muted text-foreground'
                                )
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className='flex items-center gap-1'>
                    <LanguageSwitcher />
                    <a href={site.github} target='_blank' rel='noreferrer'>
                        <Button
                            type='button'
                            variant='ghost'
                            size='icon-sm'
                            aria-label={messages.header.github}
                        >
                            <GithubIcon />
                        </Button>
                    </a>
                    <Button
                        type='button'
                        variant='ghost'
                        size='icon-sm'
                        aria-label={messages.header.toggleTheme}
                        onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
                    >
                        {resolved === 'dark' ? (
                            <Sun className='size-4' />
                        ) : (
                            <Moon className='size-4' />
                        )}
                    </Button>
                    <Button
                        type='button'
                        variant='ghost'
                        size='icon-sm'
                        className='md:hidden'
                        aria-label={open ? messages.header.closeMenu : messages.header.openMenu}
                        onClick={() => setOpen((value) => !value)}
                    >
                        {open ? <X className='size-4' /> : <Menu className='size-4' />}
                    </Button>
                </div>
            </div>

            {open ? (
                <nav className='border-t border-border px-4 py-3 md:hidden' aria-label='Mobile'>
                    <div className='flex flex-col gap-1'>
                        {nav.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === '/'}
                                onClick={() => setOpen(false)}
                                className={({ isActive }) =>
                                    cn(
                                        'rounded-md px-3 py-2 text-sm',
                                        isActive ? 'bg-muted font-medium' : 'text-muted-foreground'
                                    )
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                        <a
                            href={site.github}
                            target='_blank'
                            rel='noreferrer'
                            className='rounded-md px-3 py-2 text-sm text-muted-foreground'
                        >
                            {messages.header.github}
                        </a>
                        <div className='flex items-center justify-between rounded-md px-3 py-2'>
                            <span className='text-sm text-muted-foreground'>
                                {messages.language.label}
                            </span>
                            <LanguageSwitcher compact={false} />
                        </div>
                    </div>
                </nav>
            ) : null}
        </header>
    );
}
