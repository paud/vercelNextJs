// 统一 API 请求工具，自动加 JWT（cookie方式）
export async function apiRequest(url: string, options: RequestInit = {}) {
  // 自动带上 cookie（如 next-auth.session-token），用于 JWT 鉴权
  const response = await fetch(url, { ...options, credentials: 'include' });
  return response;
}

// 用法示例：
// const res = await apiRequest('/api/user-location-log', { method: 'POST', body: JSON.stringify(data) });
// const json = await res.json();
