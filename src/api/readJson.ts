export async function readJson<T>(response: {
  body: { json: () => Promise<unknown> };
}): Promise<T> {
  return (await response.body.json()) as T;
}
