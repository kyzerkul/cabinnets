import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Container } from '@/components/ui/container'

export interface BreadcrumbEntry {
  label: string
  href?: string
}

interface SiteBreadcrumbProps {
  items: BreadcrumbEntry[]
}

export function SiteBreadcrumb({ items }: SiteBreadcrumbProps) {
  return (
    <div className="border-b border-border bg-card py-2">
      <Container size="wide">
        <Breadcrumb>
          <BreadcrumbList>
            {items.map((item, index) => {
              const isLast = index === items.length - 1
              return (
                <BreadcrumbItem key={item.href ?? item.label}>
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : isLast ? (
                    <BreadcrumbPage className="text-sm">{item.label}</BreadcrumbPage>
                  ) : (
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                  )}
                  {!isLast && <BreadcrumbSeparator />}
                </BreadcrumbItem>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </Container>
    </div>
  )
}
