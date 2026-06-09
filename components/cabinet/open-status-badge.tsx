'use client'

import { useSyncExternalStore } from 'react'
import { Badge } from '@/components/ui/badge'
import { isOpenNow, parseWorkHours } from '@/lib/format'

// Re-evaluate open/closed status on every 1-minute tick.
function subscribeToMinuteTick(callback: () => void) {
  const id = setInterval(callback, 60_000)
  return () => clearInterval(id)
}

interface OpenStatusBadgeProps {
  workHours: unknown
}

export function OpenStatusBadge({ workHours }: OpenStatusBadgeProps) {
  const hours = parseWorkHours(workHours)

  // Server snapshot returns null so the badge is absent from SSG HTML —
  // prevents build-time open/closed values being baked into static pages.
  const open = useSyncExternalStore(
    subscribeToMinuteTick,
    () => (hours ? isOpenNow(hours) : null),
    () => null,
  )

  if (open === null) return null

  return (
    <Badge
      variant="outline"
      className={
        open
          ? 'text-green-700 border-green-200 bg-green-50 text-xs'
          : 'text-muted-foreground text-xs'
      }
    >
      {open ? 'Ouvert maintenant' : 'Fermé'}
    </Badge>
  )
}
