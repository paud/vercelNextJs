const WEBVIEW_URL = 'https://2.zzzz.tech'; // 主站地址

Page({
  data: {
    webviewUrl: WEBVIEW_URL, // 确保 webviewUrl 始终为主站地址
    token: null,
    code: ''
  },

  onLoad() {
    // 每次进入页面都自动登录，获取新 code
    this.wxLogin();
  },

  // 接收 WebView 消消息
  onWebviewMessage(e) {
    const msg = e.detail.data;
    console.log('收到 WebView 消息:', msg);
    if (msg.action === 'wechatLogin') {
      this.wxLogin();
    }
  },

  // 小程序登录逻辑
  wxLogin() {
    wx.login({
      success: ({ code }) => {
        console.log('wx.login 返回 code:', code);
        if (!code) return this.handleGuest();
        // 只保存 code，不主动请求后端，webview src 拼接最新 code
        this.setData({ code });
        // 可选：清除旧 token，保证安全
        wx.removeStorageSync('token');
      },
      fail: () => this.handleGuest()
    });
  },

  handleGuest() {
    wx.showToast({ title: '登录失败，进入游客模式', icon: 'none' });
    this.setData({ token: { jwt: 'guest' }, code: '' });
  }
});

