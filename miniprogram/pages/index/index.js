let GLOBAL_CODE = '';

const WEBVIEW_URL = 'https://2.zzzz.tech'; // 主站地址

Page({
  data: {
    webviewUrl: WEBVIEW_URL, // 确保 webviewUrl 始终为主站地址
    token: null,
    code: ''
  },

  onLoad(options) {
    // 处理分享带入的 url 参数
    this.baseUrl = options.url ? decodeURIComponent(options.url) : WEBVIEW_URL;
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
        this.setData({ code });
        GLOBAL_CODE = code;
        wx.removeStorageSync('token');
        // code 就位后再设置 webviewUrl
        this.setData({ webviewUrl: this.baseUrl + '?code=' + code });
      },
      fail: () => this.handleGuest()
    });
  },

  handleGuest() {
    wx.showToast({ title: '登录失败，进入游客模式', icon: 'none' });
    this.setData({ token: { jwt: 'guest' }, code: '' });
    GLOBAL_CODE = '';
  },

  onShareAppMessage: async function () {
    let sharePath = '/pages/index/index';
    let shareTitle = '超值分享，快来看看吧！';
    try {
      const code = GLOBAL_CODE;
      console.log('分享时 code:', code);
      if (code) {
        // 用 Promise 封装 wx.request
        const res = await new Promise((resolve, reject) => {
          wx.request({
            url: WEBVIEW_URL + '/api/user-location-log',
            method: 'GET',
            data: { code },
            success: resolve,
            fail: reject
          });
        });
        console.log('分享时接口返回:', res.data); // 这里才是后端返回的数据
        if (res.statusCode === 200 && res.data.url) {
          sharePath = `/pages/index/index?url=${encodeURIComponent(res.data.url)}`;
          shareTitle = res.data.title || shareTitle;
        } else {
          sharePath = `/pages/index/index?url=${encodeURIComponent(WEBVIEW_URL + '/zh')}`;
        }
        console.log('分享路径设置为:', sharePath);
      }
    } catch (e) {
      console.error('分享时接口异常:', e);
    }
    console.log('最终分享路径:', sharePath);
    return {
      title: shareTitle,
      path: sharePath
      // 不设置 imageUrl，微信会自动生成页面快照
    }
  }
});

