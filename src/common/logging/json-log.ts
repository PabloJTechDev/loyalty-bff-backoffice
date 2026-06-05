export function logEvent(event: string, payload: Record<string, unknown> = {}) {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      service: 'loyalty-bff-backoffice',
      event,
      ...payload,
    }),
  );
}
