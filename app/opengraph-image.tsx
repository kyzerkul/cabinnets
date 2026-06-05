import { ImageResponse } from 'next/og'

export const alt = 'Cabinets Comptables FR — Annuaire des experts-comptables en France'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#ffffff',
          fontFamily: 'system-ui, sans-serif',
          padding: '64px',
          gap: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 72,
            height: 72,
            borderRadius: 12,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          CC
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: '#0f172a',
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          Cabinets Comptables FR
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            color: '#64748b',
            textAlign: 'center',
            lineHeight: 1.4,
            maxWidth: 800,
          }}
        >
          L&apos;annuaire indépendant des experts-comptables en France
        </div>
      </div>
    ),
    { ...size },
  )
}
