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

// JS getDay() → our key
const JS_DAY_MAP: Record<number, string> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
}

export function parseWorkHours(raw: unknown): WorkHours | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  return raw as WorkHours
}

export function formatSlots(slots: DaySlot[]): string {
  if (slots.length === 0) return 'Fermé'
  return slots.map((s) => `${s.open}–${s.close}`).join(', ')
}

export function getTodayKey(): string {
  return JS_DAY_MAP[new Date().getDay()] ?? 'monday'
}

export function isOpenNow(hours: WorkHours): boolean {
  const todayKey = getTodayKey()
  const slots = hours[todayKey]
  if (!slots || slots.length === 0) return false
  const now = new Date()
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  return slots.some((s) => hhmm >= s.open && hhmm < s.close)
}
