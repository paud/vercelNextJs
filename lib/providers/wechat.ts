// 社区版 next-auth WeChat Provider（简化版，基于 https://github.com/charlie0129/next-auth-wechat/blob/main/src/index.ts）
import { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth";

export interface WeChatProfile {
  openid: string;
  nickname: string;
  sex: number;
  province: string;
  city: string;
  country: string;
  headimgurl: string;
  privilege: string[];
  unionid?: string;
}

export default function WechatProvider<P extends WeChatProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "wechat",
    name: "WeChat",
    type: "oauth",
    wellKnown: undefined, // 修复类型错误
    authorization: {
      url: "https://open.weixin.qq.com/connect/qrconnect",
      params: { scope: "snsapi_login" },
    },
    token: "https://api.weixin.qq.com/sns/oauth2/access_token",
    userinfo: "https://api.weixin.qq.com/sns/userinfo",
    profile(profile) {
      return {
        id: profile.unionid || profile.openid,
        name: profile.nickname,
        email: undefined, // 微信不返回邮箱
        image: profile.headimgurl,
      };
    },
    style: {
      logo: "/wechat.svg",
      logoDark: "/wechat.svg",
      bg: "#07c160",
      text: "#fff"
    },
    options,
  };
}
