export class ResolverError extends Error {
  constructor(message: string) {
    super(message);

    Object.defineProperty(this, 'name', { value: 'ResolverError' });
  }
}
