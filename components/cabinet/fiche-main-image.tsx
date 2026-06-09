import Image from 'next/image'

interface FicheMainImageProps {
  src: string
  alt: string
}

export function FicheMainImage({ src, alt }: FicheMainImageProps) {
  return (
    <div className="relative w-full h-48 md:h-64 overflow-hidden bg-muted">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 1280px) 100vw, 1280px"
        className="object-cover"
        priority
      />
    </div>
  )
}
