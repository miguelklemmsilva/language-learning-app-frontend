import { fetchAuthSession } from "aws-amplify/auth";

export const API_NAME = "LanguageLearningApp";

export async function authToken(): Promise<string> {
  const { tokens } = await fetchAuthSession();
  return tokens?.idToken?.toString() ?? "";
}
