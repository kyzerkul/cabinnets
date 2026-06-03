import { cn } from '@/lib/utils'

interface ContainerProps {
  children: React.ReactNode
  size?: 'wide' | 'default' | 'narrow'
  className?: string
}

export function Container({ children, size = 'default', className }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        size === 'wide' && 'max-w-7xl',
        size === 'default' && 'max-w-4xl',
        size === 'narrow' && 'max-w-3xl',
        className,
      )}
    >
      {children}
    </div>
  )
}
