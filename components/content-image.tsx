import Image from 'next/image'
import { media, type MediaKey } from '@/lib/media'
import { cn } from '@/lib/utils'

interface ContentImageProps {
  mediaKey: MediaKey
  className?: string
  fill?: boolean
  width?: number
  height?: number
  priority?: boolean
  showCredit?: boolean
  objectFit?: 'cover' | 'contain'
}

export function ContentImage({
  mediaKey,
  className,
  fill,
  width,
  height,
  priority,
  showCredit = false,
  objectFit = 'cover',
}: ContentImageProps) {
  const item = media[mediaKey]

  if (fill) {
    return (
      <div className={cn('relative', className)}>
        <Image
          src={item.src}
          alt={item.alt}
          fill
          priority={priority}
          className={objectFit === 'contain' ? 'object-contain' : 'object-cover'}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        {showCredit && (
          <p className="absolute bottom-2 right-2 rounded bg-background/80 px-2 py-0.5 text-[10px] text-muted-foreground">
            {item.credit}
          </p>
        )}
      </div>
    )
  }

  return (
    <figure className={cn('space-y-1', className)}>
      <Image
        src={item.src}
        alt={item.alt}
        width={width ?? 800}
        height={height ?? 600}
        priority={priority}
        className={cn(
          'h-auto w-full rounded-lg',
          objectFit === 'contain' ? 'object-contain' : 'object-cover',
        )}
      />
      {showCredit && (
        <figcaption className="text-[10px] text-muted-foreground">{item.credit}</figcaption>
      )}
    </figure>
  )
}
