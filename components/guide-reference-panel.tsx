import { ContentImage } from '@/components/content-image'
import { media, type MediaKey } from '@/lib/media'
import { cn } from '@/lib/utils'

interface GuideReferencePanelProps {
  title: string
  description?: string
  mediaKey: MediaKey
  className?: string
}

/** Shared layout for diagrams and photos, kept separate from step cards so steps stay icon-only. */
export function GuideReferencePanel({
  title,
  description,
  mediaKey,
  className,
}: GuideReferencePanelProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex flex-1 items-center justify-center rounded-sm border border-border bg-white p-4">
        <ContentImage
          mediaKey={mediaKey}
          width={480}
          height={360}
          objectFit="contain"
          className="w-full max-w-md"
        />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">{title}.</span>
        {description ? ` ${description}` : null}
        <span className="mt-1 block text-xs">{media[mediaKey].credit}</span>
      </p>
    </div>
  )
}
