interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * Emits a structured-data block.
 *
 * Serialised with `<` escaped so a stray angle bracket in content can't
 * close the script tag early.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
