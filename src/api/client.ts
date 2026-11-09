import { del, get, post, put } from "aws-amplify/api";
import { fetchAuthSession } from "aws-amplify/auth";
import { readJson } from "./readJson";

export const API_NAME = "LanguageLearningApp";

type JsonBody = {
  [key: string]: string | number | boolean | null | JsonBody | JsonBody[] | string[] | number[];
};

export async function authToken(): Promise<string> {
  const { tokens } = await fetchAuthSession();
  return tokens?.idToken?.toString() ?? "";
}

async function authorized() {
  return { Authorization: await authToken() };
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await get({
    apiName: API_NAME,
    path,
    options: { headers: await authorized() },
  }).response;
  return readJson<T>(response);
}

export async function apiPut<T>(path: string, body: JsonBody): Promise<T> {
  const response = await put({
    apiName: API_NAME,
    path,
    options: { headers: await authorized(), body },
  }).response;
  return readJson<T>(response);
}

export async function apiPost<T>(path: string, body: JsonBody): Promise<T> {
  const response = await post({
    apiName: API_NAME,
    path,
    options: { headers: await authorized(), body },
  }).response;
  return readJson<T>(response);
}

export async function apiDelete<T>(path: string): Promise<T | null> {
  const response = await del({
    apiName: API_NAME,
    path,
    options: { headers: await authorized() },
  }).response;
  try {
    return await readJson<T>(response as unknown as { body: { json: () => Promise<unknown> } });
  } catch {
    return null;
  }
}

export function readError(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const record = error as {
      message?: unknown;
      response?: { body?: unknown };
    };
    const body = record.response?.body;
    if (typeof body === "string" && body.length > 0) {
      try {
        const parsed = JSON.parse(body) as { message?: unknown; errorMessage?: unknown };
        if (typeof parsed.message === "string") return parsed.message;
        if (typeof parsed.errorMessage === "string") return parsed.errorMessage;
      } catch {
        if (body.length < 240) return body;
      }
    }
    if (typeof record.message === "string" && record.message.length > 0) {
      return record.message;
    }
  }
  return "Something went wrong. Please try again.";
}
