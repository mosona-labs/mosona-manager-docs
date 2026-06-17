import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import IntroductionCard from '@/components/introduction-card';
import { Button } from '@/components/ui/button';
import { usePageSeo } from '@/hooks/use-page-seo';
import { SEO } from '@/lib/seo';
import { screenshots, site, techStack } from '@/lib/site-content';

export function HomePage() {
    usePageSeo({
        title: SEO.defaultTitle,
        description: SEO.description,
        path: '/',
    });

    return (
        <div>
            <section className='relative overflow-hidden border-border'>
                <div className='absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.55_0.14_145/0.18),transparent)]' />
                <div className='relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-30'>
                    <div className='max-w-xl'>
                        <p className='mb-3 font-mono text-xs tracking-widest text-muted-foreground uppercase'>
                            Server monitor · SSH · Agents
                        </p>
                        <h1 className='mb-4 font-semibold text-4xl tracking-tight sm:text-5xl'>
                            <span className='text-green-600 dark:text-green-400'>Mosona</span>{' '}
                            Manager
                        </h1>
                        <p className='mb-4 text-lg leading-relaxed text-muted-foreground'>
                            Team-oriented / Personal server monitor and terminal management with
                            project permissions and Agent & SSH remote control.
                        </p>
                        <ul className='mb-4 flex flex-wrap gap-2'>
                            {techStack.map((item) => (
                                <li
                                    key={item}
                                    className='rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground'
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <div className='flex flex-wrap gap-3'>
                            <Button asChild>
                                <Link to='/docs/quickstart'>
                                    Get started
                                    <ArrowRight className='size-4' />
                                </Link>
                            </Button>
                            <Button variant='outline' asChild>
                                <a href={site.github} target='_blank' rel='noreferrer'>
                                    View on GitHub
                                </a>
                            </Button>
                        </div>
                    </div>
                    <div className='relative'>
                        <div className='absolute -inset-8 -z-10 rounded-full bg-green-500/25 blur-3xl dark:bg-green-400/20' />
                        <div className='overflow-hidden rounded-sm shadow-lg shadow-black/10 dark:shadow-black/40'>
                            <img
                                src={screenshots[0].src}
                                alt={`Home`}
                                className='aspect-382/211 w-full object-cover object-top bg-black'
                                loading='eager'
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className='bg-muted/70 dark:bg-accent/30'>
                <div className='mx-auto max-w-6xl px-4 py-16 text-center sm:px-6'>
                    <h2 className='mb-3 font-semibold text-2xl tracking-tight'>
                        Introduction and screenshots
                    </h2>
                    <p className='mx-auto mb-8 max-w-lg text-muted-foreground'>
                        First understand it thoroughly, then decide whether to use it in production.
                    </p>
                    <div className='mx-auto grid max-w-6xl gap-2 grid-cols-1 lg:grid-cols-2'>
                        {screenshots.map((screenshot) => (
                            <IntroductionCard
                                key={screenshot.title}
                                title={screenshot.title}
                                description={screenshot.description}
                                imgSrc={screenshot.src}
                                className='mx-auto mb-4'
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className='mx-auto max-w-6xl px-4 py-16 text-center sm:px-6'>
                <h2 className='mb-3 font-semibold text-2xl tracking-tight'>Deploy and operate</h2>
                <p className='mx-auto mb-8 max-w-lg text-muted-foreground'>
                    Docker Compose stack with Postgres and InfluxDB. Follow the quickstart to bring
                    up your hub.
                </p>
                <Button asChild size='lg'>
                    <Link to='/docs/quickstart'>Open quickstart</Link>
                </Button>
            </section>
        </div>
    );
}
