import { cn } from '@/lib/utils'

interface SectionProps {
  children: React.ReactNode
  className?: string
}

export function Section({ children, className }: SectionProps) {
  return (
    <section className={cn('py-8 md:py-12 lg:py-16', className)}>
      {children}
    </section>
  )
}
