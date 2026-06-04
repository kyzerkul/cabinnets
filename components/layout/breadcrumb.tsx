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
            {items.map((item, index) => (
              <BreadcrumbItem key={index}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <BreadcrumbPage className="text-sm">{item.label}</BreadcrumbPage>
                )}
                {index < items.length - 1 && <BreadcrumbSeparator />}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </Container>
    </div>
  )
}
