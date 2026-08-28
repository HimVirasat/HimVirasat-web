const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

export function getStringParam(req: {
  params: Record<string, unknown>;
  key: string;
}): string | undefined {
  const value = req.params[req.key];
  return typeof value === "string" ? value : undefined;
}
