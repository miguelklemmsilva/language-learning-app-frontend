import Cookie from "universal-cookie";
import { fetchAuthSession } from "aws-amplify/auth";
import { get } from "aws-amplify/api";
import { readJson } from "../../../../api/readJson";

export async function getTokenOrRefresh(): Promise<{
  authToken: string | null;
  region: string;
  error?: unknown;
}> {
  const cookie = new Cookie();
  const speechToken = cookie.get("speech-token");

  const authorization =
    (await fetchAuthSession()).tokens?.idToken?.toString() ?? "";

  if (speechToken === undefined) {
    try {
      const response = await get({
        apiName: "LanguageLearningApp",
        path: "/issuetoken",
        options: { headers: { Authorization: authorization } },
      }).response;

      const token = await readJson<string>(response);
      cookie.set("speech-token", "uksouth:" + token, { maxAge: 540, path: "/" });
      return { authToken: token, region: "uksouth" };
    } catch (err) {
      const data =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { data?: unknown } }).response?.data
          : err;
      console.error(data);
      return { authToken: null, region: "uksouth", error: data };
    }
  } else {
    const tokenValue = String(speechToken);
    const idx = tokenValue.indexOf(":");
    return {
      authToken: tokenValue.slice(idx + 1),
      region: tokenValue.slice(0, idx),
    };
  }
}
