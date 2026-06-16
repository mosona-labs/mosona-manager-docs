import { Check, ChevronDown, Copy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { highlightCode, normalizeHighlightLang } from '@/lib/shiki';
import { cn } from '@/lib/utils';

const COLLAPSE_LINE_THRESHOLD = 14;

type CollapsibleCodeBlockProps = {
    children: string;
    language?: string;
    className?: string;
};

export function CollapsibleCodeBlock({ children, language, className }: CollapsibleCodeBlockProps) {
    const code = children.replace(/\n$/, '');
    const lines = useMemo(() => code.split('\n'), [code]);
    const canCollapse = lines.length > COLLAPSE_LINE_THRESHOLD;
    const [expanded, setExpanded] = useState(!canCollapse);
    const [copied, setCopied] = useState(false);
    const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);

    const highlightLang = normalizeHighlightLang(language);

    useEffect(() => {
        if (!highlightLang) {
            setHighlightedHtml(null);
            return;
        }

        let cancelled = false;
        highlightCode(code, highlightLang)
            .then((html) => {
                if (!cancelled) {
                    setHighlightedHtml(html);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setHighlightedHtml(null);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [code, highlightLang]);

    const onCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
    };

    const displayLang = highlightLang ?? language ?? 'text';
    const showFade = canCollapse && !expanded;

    return (
        <div
            className={cn(
                'group/code my-4 overflow-hidden rounded-lg border border-border bg-muted/40',
                className
            )}
        >
            <div className='flex items-center justify-between gap-2 border-b border-border/80 bg-muted/60 px-3 py-1.5'>
                <span className='font-mono text-xs text-muted-foreground'>{displayLang}</span>
                <div className='flex items-center gap-1'>
                    {canCollapse ? (
                        <Button
                            type='button'
                            variant='ghost'
                            size='xs'
                            className='h-7 text-xs'
                            onClick={() => setExpanded((value) => !value)}
                        >
                            {expanded ? 'Collapse' : `Show all (${lines.length} lines)`}
                            <ChevronDown
                                className={cn(
                                    'size-3 transition-transform duration-300 ease-out',
                                    expanded && 'rotate-180'
                                )}
                            />
                        </Button>
                    ) : null}
                    <Button
                        type='button'
                        variant='ghost'
                        size='icon-xs'
                        aria-label='Copy code'
                        onClick={onCopy}
                    >
                        {copied ? <Check className='size-3' /> : <Copy className='size-3' />}
                    </Button>
                </div>
            </div>

            <div className='relative'>
                <div
                    className={cn(
                        'docs-code overflow-x-auto overflow-y-hidden text-[13px] leading-relaxed transition-[max-height] duration-300 ease-in-out',
                        canCollapse && !expanded && 'max-h-70',
                        canCollapse && expanded && 'max-h-[4000px]'
                    )}
                >
                    {highlightedHtml ? (
                        <div
                            className='[&_pre]:m-0 [&_pre]:bg-transparent! [&_pre]:p-4 [&_code]:font-mono'
                            // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki HTML output
                            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                        />
                    ) : (
                        <pre className='p-4'>
                            <code className='font-mono'>{code}</code>
                        </pre>
                    )}
                </div>

                {canCollapse ? (
                    <div
                        className={cn(
                            'pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-linear-to-t from-muted from-35% via-muted/70 via-65% to-transparent transition-opacity duration-300 ease-in-out dark:from-[oklch(0.24_0_0)] dark:from-35% dark:via-[oklch(0.24_0_0/0.75)] dark:via-65%',
                            showFade ? 'opacity-100' : 'opacity-0'
                        )}
                        aria-hidden
                    />
                ) : null}
            </div>
        </div>
    );
}
