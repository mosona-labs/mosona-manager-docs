import { useState } from 'react';

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

    return (
        <div className={cn('group cursor-pointer font-medium shadow-lg', className)}>
            <div className='relative text-white bg-black rounded-lg'>
                <div className='absolute bg-linear-to-t to-transparent from-black w-full h-[35%] top-[65%] z-10 rounded-lg' />
                <div className='absolute bottom-0 p-3 w-full z-20 text-start'>
                    <h2 className='text-shadow'>{title}</h2>
                    <div className='text-[0.6rem] text-muted-foreground flex items-center justify-between'>
                        <p className='text-shadow'>{description}</p>
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
    );
};

export default IntroductionCard;
