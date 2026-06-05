interface JsonLdProps {
  data: Record<string, unknown>
}

// Escapes characters that can break out of a <script> tag in HTML context.
// Uses String.fromCharCode for U+2028/U+2029 to avoid encoding them as literal
// JS line terminators in the source file (which would break the regex literals).
function serializeJsonLd(data: Record<string, unknown>): string {
  const LS = new RegExp(String.fromCharCode(0x2028), 'g')
  const PS = new RegExp(String.fromCharCode(0x2029), 'g')
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(LS, '\\u2028')
    .replace(PS, '\\u2029')
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  )
}
