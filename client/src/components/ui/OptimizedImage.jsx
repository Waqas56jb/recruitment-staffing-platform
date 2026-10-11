import { useState } from 'react'
import { cn } from '../../utils/cn'

function buildSrcSet(src) {
  if (!src?.includes('images.unsplash.com')) return undefined
  const widths = [480, 768, 1024, 1400, 1920]
  return widths
    .map((w) => {
      const url = src.replace(/([?&])w=\d+/, `$1w=${w}`)
      const withW = url.includes('w=') ? url : `${url}${url.includes('?') ? '&' : '?'}w=${w}`
      return `${withW} ${w}w`
    })
    .join(', ')
}

export default function OptimizedImage({
  src,
  alt,
  className,
  imgClassName,
  width,
  height,
  priority = false,
  sizes = '(max-width: 768px) 100vw, 50vw',
  objectPosition = 'center',
}) {
  const [failed, setFailed] = useState(false)

  if (failed || !src) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-ink-soft text-sm text-cream/60',
          className,
        )}
        role="img"
        aria-label={alt || 'Image unavailable'}
      >
        Image unavailable
      </div>
    )
  }

  return (
    <div className={cn('overflow-hidden', className)}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        srcSet={buildSrcSet(src)}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        onError={() => setFailed(true)}
        className={cn('h-full w-full object-cover', imgClassName)}
        style={{ objectPosition }}
      />
    </div>
  )
}
