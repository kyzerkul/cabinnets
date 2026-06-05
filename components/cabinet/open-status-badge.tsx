'use client'

import { Badge } from '@/components/ui/badge'
import { isOpenNow, parseWorkHours } from '@/lib/format'

interface OpenStatusBadgeProps {
  workHours: unknown
}

export function OpenStatusBadge({ workHours }: OpenStatusBadgeProps) {
  const hours = parseWorkHours(workHours)
  if (!hours) return null

  const open = isOpenNow(hours)

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
