'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'

interface MapEmbedProps {
  latitude: number
  longitude: number
  name: string
}

export function MapEmbed({ latitude, longitude, name }: MapEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)
  const mounted = useRef(true)

  useEffect(() => {
    if (initialized.current || !containerRef.current) return
    initialized.current = true
    const container = containerRef.current

    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries[0].isIntersecting || !mounted.current) return
        observer.disconnect()

        const L = (await import('leaflet')).default

        if (!mounted.current) return

        // Leaflet default icons reference broken paths in bundlers — override with CDN
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        })

        const map = L.map(container).setView([latitude, longitude], 15)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map)
        L.marker([latitude, longitude]).addTo(map).bindPopup(name)
      },
      { rootMargin: '200px' },
    )

    observer.observe(container)
    return () => {
      mounted.current = false
      observer.disconnect()
    }
  }, [latitude, longitude, name])

  return (
    <div
      ref={containerRef}
      className="h-64 rounded-lg border overflow-hidden bg-muted"
      aria-label={`Carte de localisation de ${name}`}
      role="img"
    />
  )
}
