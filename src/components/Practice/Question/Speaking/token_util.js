import Cookie from 'universal-cookie';
import { fetchAuthSession } from "aws-amplify/auth";
import { get } from "aws-amplify/api";

export async function getTokenOrRefresh() {
    const cookie = new Cookie();
    const speechToken = cookie.get('speech-token');

    const authToken =
      (await fetchAuthSession()).tokens?.idToken?.toString() ?? "";

    if (speechToken === undefined) {
        try {
            const response = await get({
                apiName: "LanguageLearningApp",
                path: "/issuetoken",
                options: { headers: { Authorization: authToken } },
            }).response;

            const token = await response.body.json();
            cookie.set('speech-token', 'uksouth:' + token, {maxAge: 540, path: '/'});
            return { authToken: token, region: 'uksouth' };
        } catch (err) {
            console.error(err.response.data);
            return { authToken: null, error: err.response.data };
        }
    } else {
        const idx = speechToken.indexOf(':');
        return { authToken: speechToken.slice(idx + 1), region: speechToken.slice(0, idx) };
    }
}