/**
 * LIFF 调试助手
 * 在开发环境中接收来自调试器的 Mock 数据
 */

export class LiffDebugHelper {
  private static instance: LiffDebugHelper;
  private mockData: any = null;
  private isDebugMode: boolean = false;

  private constructor() {
    this.isDebugMode = process.env.NODE_ENV === 'development';
    this.setupMessageListener();
  }

  static getInstance(): LiffDebugHelper {
    if (!LiffDebugHelper.instance) {
      LiffDebugHelper.instance = new LiffDebugHelper();
    }
    return LiffDebugHelper.instance;
  }

  /**
   * 设置消息监听器，接收来自调试器的 Mock 数据
   */
  private setupMessageListener() {
    if (typeof window === 'undefined') return;

    window.addEventListener('message', (event) => {
      // 安全检查：只在开发环境处理消息
      if (!this.isDebugMode) return;

      const { data } = event;
      
      if (data && data.type === 'liff-mock-inject') {
        console.log('[LIFF Debug] 收到 Mock 数据:', data.data);
        this.mockData = data.data;
        
        // 通知应用 Mock 数据已就绪
        this.notifyMockReady();
      }
    });

    console.log('[LIFF Debug] 调试助手已初始化');
  }

  /**
   * 通知调试器 LIFF 已初始化
   */
  notifyInitialized() {
    this.sendMessageToDebugger('liff-initialized', {
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 通知调试器登录成功
   */
  notifyLoginSuccess(profile: any) {
    this.sendMessageToDebugger('liff-login-success', {
      profile,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 通知调试器登录失败
   */
  notifyLoginError(error: any) {
    this.sendMessageToDebugger('liff-login-error', {
      error: error.message || error.toString(),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 发送消息到调试器
   */
  private sendMessageToDebugger(type: string, data: any) {
    if (typeof window === 'undefined') return;
    
    try {
      window.parent.postMessage({
        type,
        data
      }, '*');
      console.log(`[LIFF Debug] 发送消息到调试器: ${type}`);
    } catch (e) {
      console.error('[LIFF Debug] 发送消息失败:', e);
    }
  }

  /**
   * 通知应用 Mock 数据已就绪
   */
  private notifyMockReady() {
    const event = new CustomEvent('liff-mock-ready', {
      detail: this.mockData
    });
    window.dispatchEvent(event);
    console.log('[LIFF Debug] Mock 数据已就绪');
  }

  /**
   * 获取 Mock 数据（如果有）
   */
  getMockData(): any | null {
    return this.mockData;
  }

  /**
   * 检查是否有 Mock 数据
   */
  hasMockData(): boolean {
    return this.mockData !== null;
  }

  /**
   * 清除 Mock 数据
   */
  clearMockData() {
    this.mockData = null;
    console.log('[LIFF Debug] Mock 数据已清除');
  }

  /**
   * 检查是否在调试模式
   */
  isInDebugMode(): boolean {
    return this.isDebugMode;
  }

  /**
   * 模拟 LIFF 登录（使用 Mock 数据）
   */
  async mockLogin(): Promise<any> {
    if (!this.hasMockData()) {
      throw new Error('没有可用的 Mock 数据');
    }

    console.log('[LIFF Debug] 使用 Mock 数据模拟登录');
    
    // 模拟异步登录过程
    return new Promise((resolve) => {
      setTimeout(() => {
        this.notifyLoginSuccess(this.mockData);
        resolve(this.mockData);
      }, 500);
    });
  }

  /**
   * 获取调试信息
   */
  getDebugInfo() {
    return {
      isDebugMode: this.isDebugMode,
      hasMockData: this.hasMockData(),
      mockData: this.mockData,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      isInIframe: typeof window !== 'undefined' ? window.self !== window.top : false
    };
  }

  /**
   * 打印调试信息到控制台
   */
  printDebugInfo() {
    console.log('=== LIFF 调试信息 ===');
    console.table(this.getDebugInfo());
  }
}

// 导出单例实例
export const liffDebugHelper = LiffDebugHelper.getInstance();

// 在浏览器环境中添加到 window 对象，方便调试
if (typeof window !== 'undefined') {
  (window as any).liffDebugHelper = liffDebugHelper;
}
