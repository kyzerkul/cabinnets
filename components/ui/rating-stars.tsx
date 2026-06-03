'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingStarsProps {
  rating: number
  count?: number
  className?: string
}

export function RatingStars({ rating, count, className }: RatingStarsProps) {
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.5

  return (
    <span
      className={cn('inline-flex items-center gap-1', className)}
      aria-label={`Note : ${rating} sur 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4',
            i < full
              ? 'fill-amber-400 text-amber-400'
              : i === full && hasHalf
                ? 'fill-amber-200 text-amber-400'
                : 'fill-none text-muted-foreground',
          )}
          aria-hidden="true"
        />
      ))}
      {count !== undefined && (
        <span className="text-sm text-muted-foreground ml-0.5">({count})</span>
      )}
    </span>
  )
}
