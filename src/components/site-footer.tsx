import { useLocale } from '@/components/locale-provider';
import { site } from '@/lib/site-content';

export function SiteFooter() {
    const { messages } = useLocale();

    return (
        <footer className='border-t border-border'>
            <div className='mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6'>
                <div>
                    <a
                        href='https://github.com/mosona-labs'
                        target='_blank'
                        className='hover:underline'
                        rel='noopener'
                    >
                        Mosona Labs
                    </a>{' '}
                    @ 2026
                </div>
                <div className='flex flex-wrap gap-4'>
                    <a
                        href={site.github}
                        target='_blank'
                        rel='noreferrer'
                        className='hover:text-foreground'
                    >
                        {messages.footer.github}
                    </a>
                    <a
                        href={site.discord}
                        target='_blank'
                        rel='noreferrer'
                        className='hover:text-foreground'
                    >
                        {messages.footer.discord}
                    </a>
                    <a
                        href={site.discussions}
                        target='_blank'
                        rel='noreferrer'
                        className='hover:text-foreground'
                    >
                        {messages.footer.discussions}
                    </a>
                </div>
            </div>
        </footer>
    );
}
