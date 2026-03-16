/**
 * Slugs de las 7 condiciones (Conditions We Support).
 * Usado en getStaticPaths y en el cliente para cargar por API cuando no hay datos en build.
 */
export const CONDITION_SLUGS = [
  'anxiety',
  'adhd',
  'depression',
  'bipolar',
  'trauma',
  'stress',
  'identity',
] as const;

export type ConditionSlug = (typeof CONDITION_SLUGS)[number];

export function isConditionSlug(s: string): s is ConditionSlug {
  return (CONDITION_SLUGS as readonly string[]).includes(s);
}
