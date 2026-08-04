import { Languages } from 'lucide-react';

import { useLocale } from '@/components/locale-provider';
import { Button } from '@/components/ui/button';
import { formatMessage, getLocaleMeta, type LocaleCode } from '@/lib/i18n';

type MissingTranslationCardProps = {
    /** Locales that have a real copy of this page (excluding the active locale). */
    availableLocales: LocaleCode[];
    className?: string;
};

export function MissingTranslationCard({
    availableLocales,
    className,
}: MissingTranslationCardProps) {
    const { locale, setLocale, messages, defaultLocale } = useLocale();
    const currentMeta = getLocaleMeta(locale);
    const defaultMeta = getLocaleMeta(defaultLocale);

    const otherLocales = availableLocales.filter(
        (code) => code !== locale && code !== defaultLocale
    );

    return (
        <aside
            className={`mb-6 rounded-lg border border-border bg-muted/50 p-4 text-sm ${className ?? ''}`}
            role='status'
        >
            <div className='flex gap-3'>
                <div className='mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-background border border-border'>
                    <Languages className='size-4 text-muted-foreground' />
                </div>
                <div className='min-w-0 flex-1'>
                    <p className='font-medium text-foreground'>
                        {formatMessage(messages.docs.missingTranslationTitle, {
                            language: currentMeta.nativeName,
                        })}
                    </p>
                    <p className='mt-1 text-muted-foreground'>
                        {messages.docs.missingTranslationDescription}
                    </p>

                    <div className='mt-3 flex flex-wrap gap-2'>
                        <Button
                            type='button'
                            size='sm'
                            variant='outline'
                            onClick={() => setLocale(defaultLocale)}
                        >
                            {formatMessage(messages.docs.readOriginal, {
                                language: defaultMeta.nativeName,
                            })}
                        </Button>
                    </div>

                    {otherLocales.length > 0 ? (
                        <div className='mt-4 border-t border-border pt-3'>
                            <p className='mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase'>
                                {messages.docs.otherTranslations}
                            </p>
                            <ul className='flex flex-wrap gap-2'>
                                {otherLocales.map((code) => {
                                    const meta = getLocaleMeta(code);
                                    return (
                                        <li key={code}>
                                            <Button
                                                type='button'
                                                size='xs'
                                                variant='secondary'
                                                onClick={() => setLocale(code)}
                                            >
                                                {meta.nativeName}
                                            </Button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ) : null}
                </div>
            </div>
        </aside>
    );
}
