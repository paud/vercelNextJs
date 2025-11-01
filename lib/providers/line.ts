// 社区版 next-auth Line Provider（简化版，基于 https://github.com/charlie0129/next-auth-line/blob/main/src/index.ts）
import { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth";

export interface LineProfile {
  sub: string;
  name: string;
  picture: string;
  email?: string;
}

export default function LineProvider<P extends LineProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "line",
    name: "LINE",
    type: "oauth",
    authorization: {
      url: "https://access.line.me/oauth2/v2.1/authorize",
      params: { 
        scope: "profile"
      },
    },
    token: "https://api.line.me/oauth2/v2.1/token",
    userinfo: "https://api.line.me/v2/profile",
    profile(profile: any) {
      return {
        id: profile.userId || profile.sub,
        name: profile.displayName || profile.name,
        email: profile.email,
        image: profile.pictureUrl || profile.picture,
      };
    },
    style: {
      logo: "/line.svg",
      logoDark: "/line.svg",
      bg: "#00c300",
      text: "#fff"
    },
    checks: ["state"],
    ...options,
  };
}
