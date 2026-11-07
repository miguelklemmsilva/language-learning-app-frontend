import { ResourcesConfig } from "aws-amplify";

const userPoolId = "eu-west-2_RIZsiBQTD";
const userPoolClientId = "6oqt0poampv75tagretkn6prib";
const region = "eu-west-2";

export const amplifyConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId,
      userPoolClientId,
      loginWith: {
        oauth: {
          redirectSignIn: [
            "http://localhost:3000/home",
            "https://miguelklemmsilva.com/home",
          ],
          redirectSignOut: [
            "http://localhost:3000",
            "https://miguelklemmsilva.com",
          ],
          domain: "poly-bara.auth.eu-west-2.amazoncognito.com",
          scopes: ["email", "openid"],
          responseType: "code",
          providers: ["Google"],
        },
      },
    },
  },
  API: {
    REST: {
      LanguageLearningApp: {
        endpoint: "https://api.miguelklemmsilva.com",
        region,
      },
    },
  },
};
