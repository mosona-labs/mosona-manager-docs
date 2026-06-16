import { useState } from 'react';

import { X, ZoomIn } from 'lucide-react';
import { Dialog } from 'radix-ui';

import { cn } from '@/lib/utils';

const IntroductionCard = ({
    title,
    description,
    imgSrc,
    className,
}: {
    title: string;
    description: string;
    imgSrc: string;
    className?: string;
}) => {
    const [loaded, setLoaded] = useState(false);
    const [open, setOpen] = useState(false);

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <div className={cn('group cursor-pointer font-medium shadow-lg w-full', className)}>
                    <div className='relative text-white bg-black rounded-lg'>
                        <div className='absolute bg-linear-to-t to-transparent from-black w-full h-[35%] top-[65%] z-10 rounded-lg' />
                        <div className='absolute bottom-0 p-3 w-full z-20 text-start'>
                            <h2 className='text-shadow'>{title}</h2>
                            <div className='text-[0.6rem] text-muted-foreground flex items-center justify-between'>
                                <p className='text-shadow'>{description}</p>
                                <ZoomIn className='size-3 opacity-70 transition-opacity group-hover:opacity-100' />
                            </div>
                        </div>

                        <div className='overflow-hidden rounded-lg bg-muted aspect-1789/989'>
                            <img
                                src={imgSrc}
                                alt={title}
                                onLoad={() => setLoaded(true)}
                                className={cn(
                                    'w-full h-full object-cover transition-all duration-300 ease-out group-hover:scale-101',
                                    loaded ? 'opacity-100' : 'opacity-0'
                                )}
                            />
                        </div>
                    </div>
                </div>
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className='fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0' />
                <Dialog.Content className='fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'>
                    <Dialog.Title className='sr-only'>{title}</Dialog.Title>
                    <Dialog.Description className='sr-only'>{description}</Dialog.Description>
                    <div className='relative overflow-hidden rounded-md'>
                        <img
                            src={imgSrc}
                            alt={title}
                            className='aspect-1789/989 w-full object-cover object-top'
                        />
                    </div>
                    <Dialog.Close asChild>
                        <button
                            type='button'
                            className='absolute right-3 bottom-3 flex size-8 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 focus-visible:outline-none'
                            aria-label='Close preview'
                        >
                            <X className='size-4' />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default IntroductionCard;
