import { TwitterOpenApi } from "twitter-openapi-typescript";
import axios from "axios";

export const xGuestClient = async () => {
  const GUEST_TOKEN = process.env.GET_ID_X_TOKEN!;
  const resp = await axios.get("https://x.com/manifest.json", {
    headers: {
      cookie: `auth_token=${GUEST_TOKEN}`,
    },
  });
  
  const resCookie = resp.headers["set-cookie"] as string[];
  const cookieObj = resCookie.reduce((acc: Record<string, string>, cookie: string) => {
    const [name, value] = cookie.split(";")[0].split("=");
    acc[name] = value;
    return acc;
  }, {});

  const api = new TwitterOpenApi();
  const client = await api.getClientFromCookies({...cookieObj, auth_token: GUEST_TOKEN});
  return client;
};

