import { DAY_LABELS, DAY_ORDER, formatSlots, parseWorkHours } from '@/lib/format'
import { OpenStatusBadge } from '@/components/cabinet/open-status-badge'

interface OpeningHoursProps {
  workHours: unknown
}

export function OpeningHours({ workHours }: OpeningHoursProps) {
  const hours = parseWorkHours(workHours)
  if (!hours) return null

  const days = DAY_ORDER.filter((d) => d in hours)
  if (days.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-lg font-semibold">Horaires d&apos;ouverture</h2>
        <OpenStatusBadge workHours={workHours} />
      </div>
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {days.map((day) => {
              const slots = hours[day] ?? []
              return (
                <tr key={day} className="border-b last:border-0 odd:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium w-32">{DAY_LABELS[day] ?? day}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{formatSlots(slots)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
