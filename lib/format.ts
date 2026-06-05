export type DaySlot = { open: string; close: string }
export type WorkHours = Partial<Record<string, DaySlot[]>>

export const DAY_LABELS: Record<string, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
}

export const DAY_ORDER = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

export function parseWorkHours(raw: unknown): WorkHours | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const result: WorkHours = {}
  for (const [key, value] of Object.entries(raw)) {
    if (!Array.isArray(value)) continue
    const slots = value.filter(
      (slot): slot is DaySlot =>
        typeof slot === 'object' &&
        slot !== null &&
        typeof (slot as Record<string, unknown>).open === 'string' &&
        typeof (slot as Record<string, unknown>).close === 'string',
    )
    if (slots.length > 0) result[key] = slots
  }
  return Object.keys(result).length > 0 ? result : null
}

export function formatSlots(slots: DaySlot[]): string {
  if (slots.length === 0) return 'Fermé'
  return slots.map((s) => `${s.open}–${s.close}`).join(', ')
}

// Business hours are in Europe/Paris — always compare against Paris local time,
// not the visitor's browser timezone (may differ for international visitors).
export function getTodayKey(): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Paris',
    weekday: 'long',
  })
    .format(new Date())
    .toLowerCase()
}

export function isOpenNow(hours: WorkHours): boolean {
  const now = new Date()
  const todayKey = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Paris',
    weekday: 'long',
  })
    .format(now)
    .toLowerCase()

  const slots = hours[todayKey]
  if (!slots || slots.length === 0) return false

  const hhmm = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Paris',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now)

  return slots.some((s) => hhmm >= s.open && hhmm < s.close)
}
