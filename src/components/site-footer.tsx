import { site } from '@/lib/site-content';

export function SiteFooter() {
    return (
        <footer className='border-t border-border'>
            <div className='mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6'>
                <div><a href='https://github.com/mosona-labs' target='_blank' className='hover:underline'>Mosona Labs</a> @ 2026</div>
                <div className='flex flex-wrap gap-4'>
                    <a
                        href={site.github}
                        target='_blank'
                        rel='noreferrer'
                        className='hover:text-foreground'
                    >
                        GitHub
                    </a>
                    <a
                        href={site.discord}
                        target='_blank'
                        rel='noreferrer'
                        className='hover:text-foreground'
                    >
                        Discord
                    </a>
                    <a
                        href={site.discussions}
                        target='_blank'
                        rel='noreferrer'
                        className='hover:text-foreground'
                    >
                        Discussions
                    </a>
                </div>
            </div>
        </footer>
    );
}
