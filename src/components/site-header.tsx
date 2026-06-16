import { Menu, Moon, Sun, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { GithubIcon } from './icons';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { site } from '@/lib/site-content';
import { cn } from '@/lib/utils';

const nav = [
    { to: '/', label: 'Home' },
    { to: '/docs', label: 'Docs' },
] as const;

export function SiteHeader() {
    const { theme, setTheme } = useTheme();
    const [open, setOpen] = useState(false);

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
                    Mosona Manager
                </Link>

                <nav className='hidden items-center gap-1 md:flex flex-1' aria-label='Main'>
                    {nav.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
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
                    <a href={site.github} target='_blank' rel='noreferrer'>
                        <Button type='button' variant='ghost' size='icon-sm' aria-label='Github'>
                            <GithubIcon />
                        </Button>
                    </a>
                    <Button
                        type='button'
                        variant='ghost'
                        size='icon-sm'
                        aria-label='Toggle theme'
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
                        aria-label={open ? 'Close menu' : 'Open menu'}
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
                            GitHub
                        </a>
                    </div>
                </nav>
            ) : null}
        </header>
    );
}
