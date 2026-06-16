import { Check, ChevronDown, Copy } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const COLLAPSE_LINE_THRESHOLD = 14;
const COLLAPSED_MAX_LINES = 8;

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

    const visibleCode =
        expanded || !canCollapse ? code : lines.slice(0, COLLAPSED_MAX_LINES).join('\n');

    const onCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            className={cn(
                'group/code my-4 overflow-hidden rounded-lg border border-border bg-muted/40',
                className
            )}
        >
            <div className='flex items-center justify-between gap-2 border-b border-border/80 bg-muted/60 px-3 py-1.5'>
                <span className='font-mono text-xs text-muted-foreground'>
                    {language ?? 'text'}
                </span>
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
                                    'size-3 transition-transform',
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
            <pre
                className={cn(
                    'overflow-x-auto p-4 text-[13px] leading-relaxed',
                    !expanded && canCollapse && 'max-h-50'
                )}
            >
                <code className='font-mono'>{visibleCode}</code>
            </pre>
            {!expanded && canCollapse ? (
                <div className='pointer-events-none -mt-10 h-10 bg-linear-to-t from-muted/90 to-transparent' />
            ) : null}
        </div>
    );
}
