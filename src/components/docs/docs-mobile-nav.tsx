import type { DocNavSection } from '@/lib/docs';

import { PanelLeft, X } from 'lucide-react';
import { Dialog } from 'radix-ui';
import { useState } from 'react';

import { DocsSidebarNav } from '@/components/docs/docs-sidebar-nav';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DocsMobileNavProps = {
    sections: DocNavSection[];
    activeSlug: string;
    currentTitle: string;
    openLabel: string;
    closeLabel: string;
    className?: string;
};

export function DocsMobileNav({
    sections,
    activeSlug,
    currentTitle,
    openLabel,
    closeLabel,
    className,
}: DocsMobileNavProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <div className={cn('mb-6 flex items-center gap-3 lg:hidden', className)}>
                <Dialog.Trigger asChild>
                    <Button type='button' variant='outline' size='sm' className='shrink-0 gap-2'>
                        <PanelLeft data-icon='inline-start' />
                        {openLabel}
                    </Button>
                </Dialog.Trigger>
            </div>

            <Dialog.Portal>
                <Dialog.Overlay
                    className={cn(
                        'fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px]',
                        'data-[state=open]:animate-in data-[state=closed]:animate-out',
                        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
                    )}
                />
                <Dialog.Content
                    className={cn(
                        'fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(100%,20rem)] flex-col',
                        'border-r border-border bg-background shadow-2xl outline-none',
                        'data-[state=open]:animate-in data-[state=closed]:animate-out',
                        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                        'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
                        'duration-200'
                    )}
                >
                    <div className='flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border px-4'>
                        <Dialog.Title className='font-medium text-sm'>{openLabel}</Dialog.Title>
                        <Dialog.Description className='sr-only'>{currentTitle}</Dialog.Description>
                        <Dialog.Close asChild>
                            <Button
                                type='button'
                                variant='ghost'
                                size='icon-sm'
                                aria-label={closeLabel}
                            >
                                <X />
                            </Button>
                        </Dialog.Close>
                    </div>

                    <div
                        className={cn(
                            'min-h-0 flex-1 overflow-y-auto overscroll-none px-3 py-4',
                            'scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
                        )}
                    >
                        <DocsSidebarNav
                            sections={sections}
                            activeSlug={activeSlug}
                            onNavigate={() => setOpen(false)}
                        />
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
