export function getIsNavigate() {
  const [entry] = performance.getEntriesByType('navigation');
  const type = (entry as any).type;
  return type === 'navigate';
}
