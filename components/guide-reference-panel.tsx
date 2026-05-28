import { ContentImage } from '@/components/content-image'
import type { MediaKey } from '@/lib/media'
import { cn } from '@/lib/utils'

interface GuideReferencePanelProps {
  title: string
  description?: string
  mediaKey: MediaKey
  className?: string
}

/** Shared layout for diagrams and photos — kept separate from step cards so steps stay icon-only. */
export function GuideReferencePanel({
  title,
  description,
  mediaKey,
  className,
}: GuideReferencePanelProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-muted/20 p-4 sm:p-5', className)}>
      <p className="text-sm font-medium">{title}</p>
      {description ? (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-4 flex justify-center rounded-lg border border-border/60 bg-background/80 p-3">
        <ContentImage
          mediaKey={mediaKey}
          width={480}
          height={360}
          objectFit="contain"
          showCredit
          className="max-w-full"
        />
      </div>
    </div>
  )
}
