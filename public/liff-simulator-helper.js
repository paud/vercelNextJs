/**
 * LIFF 模拟器辅助脚本
 * 
 * 这个脚本帮助你的应用接收来自 LINE 浏览器模拟器的模拟 LIFF 数据
 * 在开发环境中使用，方便测试不同的登录状态
 * 
 * 使用方法:
 * 1. 在你的应用中引入这个脚本 (在 LIFF SDK 之前)
 * 2. 脚本会自动拦截 LIFF API 调用并返回模拟数据
 * 3. 在 LINE 浏览器模拟器中打开你的应用即可测试
 */

(function() {
    'use strict';

    console.log('%c[LIFF Simulator Helper] 已加载', 'color: #06c755; font-weight: bold;');

    // 检测是否在 iframe 中运行
    const isInIframe = window !== window.parent;
    
    if (!isInIframe) {
        console.log('%c[LIFF Simulator Helper] 不在 iframe 中，跳过初始化', 'color: #ff9800;');
        return;
    }

    // 存储模拟的 LIFF 数据
    let mockLiffData = null;

    // 从 localStorage 加载模拟数据
    function loadMockData() {
        try {
            const stored = localStorage.getItem('liff_mock_data');
            if (stored) {
                mockLiffData = JSON.parse(stored);
                console.log('%c[LIFF Simulator Helper] 已加载模拟数据', 'color: #06c755;', mockLiffData);
                return true;
            }
        } catch (e) {
            console.error('[LIFF Simulator Helper] 加载模拟数据失败:', e);
        }
        return false;
    }

    // 初始加载
    loadMockData();

    // 向父窗口请求 LIFF 数据
    function requestLiffData() {
        console.log('%c[LIFF Simulator Helper] 请求 LIFF 数据...', 'color: #06c755;');
        window.parent.postMessage({
            type: 'request-liff-data'
        }, '*');
    }

    // 监听来自父窗口的消息
    window.addEventListener('message', function(event) {
        if (!event.data || !event.data.type) return;

        console.log('%c[LIFF Simulator Helper] 收到消息:', 'color: #06c755;', event.data);

        switch (event.data.type) {
            case 'liff-init':
            case 'liff-data-response':
                // 更新模拟数据
                if (event.data.user) {
                    mockLiffData = {
                        user: event.data.user,
                        accessToken: event.data.accessToken,
                        idToken: event.data.idToken,
                        isLoggedIn: event.data.status === 'authorized',
                        isExpired: event.data.isExpired || false,
                        context: {
                            type: 'utou',
                            viewType: 'full',
                            userId: event.data.user.userId,
                            utouId: event.data.user.userId
                        }
                    };
                    
                    // 保存到 localStorage
                    try {
                        localStorage.setItem('liff_mock_data', JSON.stringify(mockLiffData));
                    } catch (e) {
                        console.error('[LIFF Simulator Helper] 保存模拟数据失败:', e);
                    }
                } else {
                    mockLiffData = null;
                    localStorage.removeItem('liff_mock_data');
                }
                
                console.log('%c[LIFF Simulator Helper] LIFF 数据已更新', 'color: #06c755;', mockLiffData);
                break;

            case 'liff-auth-changed':
                // 授权状态变化
                if (event.data.status === 'unauthorized') {
                    mockLiffData = null;
                    localStorage.removeItem('liff_mock_data');
                    console.log('%c[LIFF Simulator Helper] 用户已登出', 'color: #ff6b6b;');
                } else if (event.data.user) {
                    loadMockData();
                    console.log('%c[LIFF Simulator Helper] 用户已登录', 'color: #06c755;');
                }
                
                // 触发自定义事件，通知应用状态变化
                window.dispatchEvent(new CustomEvent('liff-auth-changed', {
                    detail: {
                        status: event.data.status,
                        user: event.data.user
                    }
                }));
                break;
        }
    });

    // 如果没有模拟数据，尝试请求
    if (!mockLiffData) {
        requestLiffData();
    }

    // 拦截 LIFF SDK 的初始化
    const originalLiff = window.liff;
    
    // 创建模拟的 LIFF 对象
    window.liff = {
        // 初始化
        init: async function(config) {
            console.log('%c[LIFF Simulator Helper] liff.init() 被调用', 'color: #06c755;', config);
            
            // 确保有模拟数据
            if (!mockLiffData) {
                await new Promise(resolve => {
                    requestLiffData();
                    // 等待数据返回
                    const checkData = setInterval(() => {
                        if (loadMockData()) {
                            clearInterval(checkData);
                            resolve();
                        }
                    }, 100);
                    
                    // 超时
                    setTimeout(() => {
                        clearInterval(checkData);
                        resolve();
                    }, 3000);
                });
            }
            
            return Promise.resolve();
        },

        // 检查是否登录
        isLoggedIn: function() {
            const result = mockLiffData && mockLiffData.isLoggedIn && !mockLiffData.isExpired;
            console.log('%c[LIFF Simulator Helper] liff.isLoggedIn() =', 'color: #06c755;', result);
            return result;
        },

        // 获取用户信息
        getProfile: async function() {
            console.log('%c[LIFF Simulator Helper] liff.getProfile() 被调用', 'color: #06c755;');
            
            if (!mockLiffData || !mockLiffData.user) {
                throw new Error('User is not logged in');
            }
            
            return Promise.resolve(mockLiffData.user);
        },

        // 获取 Access Token
        getAccessToken: function() {
            // 优先从 localStorage 读取最新 liff_mock_data
            let token = null;
            try {
                const stored = localStorage.getItem('liff_mock_data');
                if (stored) {
                    const data = JSON.parse(stored);
                    token = data.accessToken || null;
                }
            } catch (e) {
                console.error('[LIFF Simulator Helper] 读取 access token 失败:', e);
            }
            // 兼容旧逻辑
            if (!token && mockLiffData) {
                token = mockLiffData.accessToken || null;
            }
            console.log('%c[LIFF Simulator Helper] liff.getAccessToken() =', 'color: #06c755;', token ? token.substring(0, 30) + '...' : null);
            return token;
        },

        // 获取 ID Token
        getIDToken: function() {
            const token = mockLiffData ? mockLiffData.idToken : null;
            console.log('%c[LIFF Simulator Helper] liff.getIDToken() =', 'color: #06c755;', token ? token.substring(0, 30) + '...' : null);
            return token;
        },

        // 获取上下文
        getContext: function() {
            const context = mockLiffData ? mockLiffData.context : null;
            console.log('%c[LIFF Simulator Helper] liff.getContext() =', 'color: #06c755;', context);
            return context;
        },

        // 登录
        login: function(config) {
            console.log('%c[LIFF Simulator Helper] liff.login() 被调用', 'color: #06c755;', config);
            alert('请在模拟器控制面板中点击"模拟登录"按钮');
        },

        // 登出
        logout: function() {
            console.log('%c[LIFF Simulator Helper] liff.logout() 被调用', 'color: #06c755;');
            mockLiffData = null;
            localStorage.removeItem('liff_mock_data');
            
            // 通知父窗口
            window.parent.postMessage({
                type: 'liff-status',
                status: 'logged-out'
            }, '*');
            
            alert('已登出，页面将刷新');
            window.location.reload();
        },

        // 关闭窗口
        closeWindow: function() {
            console.log('%c[LIFF Simulator Helper] liff.closeWindow() 被调用', 'color: #06c755;');
            
            if (confirm('确定要关闭窗口吗？')) {
                window.parent.postMessage({
                    type: 'liff-close-window'
                }, '*');
            }
        },

        // 检查是否在客户端
        isInClient: function() {
            return true; // 模拟器中始终返回 true
        },

        // 获取操作系统
        getOS: function() {
            const ua = navigator.userAgent;
            if (ua.includes('iPhone') || ua.includes('iPad')) {
                return 'ios';
            } else if (ua.includes('Android')) {
                return 'android';
            }
            return 'web';
        },

        // 获取语言
        getLanguage: function() {
            return navigator.language || 'zh-TW';
        },

        // 获取版本
        getVersion: function() {
            return '2.22.3'; // 模拟的 LIFF 版本
        },

        // 检查 API 是否可用
        isApiAvailable: function(apiName) {
            console.log('%c[LIFF Simulator Helper] liff.isApiAvailable(' + apiName + ')', 'color: #06c755;');
            // 大部分 API 在模拟器中可用
            return ['shareTargetPicker', 'profile', 'openWindow', 'closeWindow'].includes(apiName);
        },

        // 分享目标选择器
        shareTargetPicker: async function(messages) {
            console.log('%c[LIFF Simulator Helper] liff.shareTargetPicker() 被调用', 'color: #06c755;', messages);
            alert('分享功能在模拟器中不可用\n消息内容: ' + JSON.stringify(messages, null, 2));
            return Promise.resolve();
        },

        // 打开外部浏览器
        openWindow: function(params) {
            console.log('%c[LIFF Simulator Helper] liff.openWindow() 被调用', 'color: #06c755;', params);
            
            if (params.url) {
                if (params.external) {
                    window.open(params.url, '_blank');
                } else {
                    window.location.href = params.url;
                }
            }
        },

        // 发送消息到聊天
        sendMessages: async function(messages) {
            console.log('%c[LIFF Simulator Helper] liff.sendMessages() 被调用', 'color: #06c755;', messages);
            alert('发送消息功能在模拟器中不可用\n消息内容: ' + JSON.stringify(messages, null, 2));
            return Promise.resolve();
        },

        // 准备就绪
        ready: Promise.resolve()
    };

    console.log('%c[LIFF Simulator Helper] LIFF 对象已创建', 'color: #06c755;');
    console.log('%c[LIFF Simulator Helper] 模拟器辅助脚本已初始化完成', 'color: #06c755; font-weight: bold;');

    // 如果原始 LIFF 存在，保存引用
    if (originalLiff) {
        window._originalLiff = originalLiff;
        console.log('%c[LIFF Simulator Helper] 原始 LIFF 对象已保存为 _originalLiff', 'color: #06c755;');
    }

    // 通知父窗口脚本已加载
    window.parent.postMessage({
        type: 'liff-simulator-helper-ready'
    }, '*');
})();
