import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";

function isFacebookWebview() {
  if (typeof window !== "undefined") {
    // 检测 Facebook 内置浏览器
    return /FBAN|FBAV|FB_IAB|FBSS|FBMD/.test(navigator.userAgent);
  }
  return false;
}

export default function FacebookAuthWrapper() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (!isFacebookWebview()) return;
    if (status === "loading") return;
    if (session?.user) return; // 已登录无需重复
    // 自动触发 Facebook 登录
    signIn("facebook", { redirect: true });
  }, [session, status]);

  return null;
}
