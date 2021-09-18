export class ResolverError extends Error {
  public expose = true;

  constructor(message: string) {
    super(message);

    Object.defineProperty(this, 'name', { value: 'ResolverError' });
  }
}
