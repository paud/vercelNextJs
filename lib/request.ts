// 统一 API 请求工具，自动加 JWT
export async function apiRequest(url: string, options: RequestInit = {}) {
  // 从 localStorage 或 cookie 获取 JWT
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const response = await fetch(url, { ...options, headers });
  return response;
}

// 用法示例：
// const res = await apiRequest('/api/user-location-log', { method: 'POST', body: JSON.stringify(data) });
// const json = await res.json();
