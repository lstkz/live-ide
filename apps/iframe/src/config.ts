export const PARENT_ORIGIN = process.env.PARENT_ORIGIN!;

if (!PARENT_ORIGIN) {
  throw new Error('PARENT_ORIGIN is not set');
}
