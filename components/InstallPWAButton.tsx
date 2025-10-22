"use client";
import { useEffect, useState, useRef } from "react";
import { useTranslations } from 'next-intl';
import '@khmyznikov/pwa-install';

export default function InstallPWAButton() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isPWA, setIsPWA] = useState(false);
    const [swState, setSwState] = useState<string | undefined>(undefined); // 修复: 声明 swState
    const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null); // 补充: 声明 waitingWorker
    const t = useTranslations('PWA');

    //相当于pwaInstallRef.current = document.querySelector("pwa-install");在useEffect前执行
    const pwaInstallRef = useRef<any>(null);


    useEffect(() => {
        //var pwaInstall: any;

        import("@khmyznikov/pwa-install").then(() => {
            const container = document.getElementById("pwa-install-container"); // 指定 div
            if (!container) return;

            const el = document.createElement("pwa-install");

            // 可以在这里设置样式，如果你希望它固定在 div 内，也可以用相对定位
            el.style.position = "relative"; // 或者 "absolute"，不要再用 fixed，否则脱离 div
            el.style.bottom = "0px";
            el.style.right = "0px";
            el.style.zIndex = "1000";

            container.appendChild(el); // 插入到 div

            return () => {
                el.remove();
            };
        }).catch((e) =>
            console.error("Failed to load pwa-install:", e)
        );


        // 检测是否从 PWA 打开
        const checkPWA = () => {
            const standalone =
                window.matchMedia('(display-mode: standalone)').matches || // Chrome / Edge
                (window.navigator as any).standalone || // Safari iOS
                document.referrer.startsWith('android-app://'); // Android WebAPK
            setIsPWA(standalone);
        };

        checkPWA();
        // 拿到自定义组件引用
        //pwaInstallRef.current = document.querySelector("pwa-install");
        // 监听 beforeinstallprompt 事件
        const handler = (e: any) => {
            e.preventDefault(); // 阻止浏览器自动弹窗
            console.log("beforeinstallprompt 触发了");
            setDeferredPrompt(e); // 保存事件对象
        };

        window.addEventListener("beforeinstallprompt", handler);

        if ("serviceWorker" in navigator) {
            if (navigator.serviceWorker.controller) {
                console.log("Active service worker found, no need to register");
            } else {
                navigator.serviceWorker.register('/service-worker.js', { scope: '/pwa-install/' }).then(function (reg) {
                    console.log("Service worker registered");
                });
            }
        }

        return () => window.removeEventListener("beforeinstallprompt", handler);

    }, []);

    const handleInstall = async () => {
        // 优先显示自定义弹窗
        // 其次调用浏览器原生安装提示
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log("安装结果:", outcome);
            setDeferredPrompt(null);
        } else if (pwaInstallRef.current) {
            console.log("第一个弹出窗口:");
            pwaInstallRef.current.showDialog(true);
        } else {
            console.log("无法触发安装：beforeinstallprompt 尚未触发");
        }

    };
    if (isPWA) return null;

    return (
        <div id="pwa-install-container" className="relative">
            <script type="module" src="/pwa-install.bundle.js"></script>
            {/* <pwa-install id="pwa-install" manifest-url="/manifest.json" ref={pwaInstallRef}></pwa-install> */}
            <button
                onClick={handleInstall}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition font-semibold text-sm"
                style={{ minWidth: 100 }}
            >
                {/* 安装 App 图标 */}
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17v-6m0 0l-3 3m3-3l3 3" />
                    <rect x="6" y="4" width="12" height="16" rx="2" stroke="currentColor" strokeWidth={2} fill="none" />
                </svg>
                {t('installApp')}
            </button>
        </div>
    );
}
