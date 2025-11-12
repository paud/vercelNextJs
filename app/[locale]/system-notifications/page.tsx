"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useCombinedAuth } from "@/hooks/useCombinedAuth";
import UserHeader from '../../../components/UserHeader';
import { apiRequest } from '@/lib/request';

interface Notification {
  id: number;
  title: string;
  content: string;
  type?: string;
  read: boolean;
  createdAt: string;
  userId?: number; // 增加 userId 字段用于区分
}

const PAGE_SIZE = 10;

export default function SystemNotificationsPage() {
  const t = useTranslations("SystemNotification");
  const locale = useLocale();
  const { currentUser, isLoading } = useCombinedAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // 分页数据
  const paged = notifications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(notifications.length / PAGE_SIZE);

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest("/api/system-notifications");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setNotifications(data);
    } catch (e) {
      setError(t("loading"));
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(id: number) {
    setSelected((prev) => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }
  function selectAllOnPage() {
    // 只选中未被禁用的通知（userId != null）
    const selectableIds = paged.filter(n => n.userId != null).map(n => n.id);
    // 如果所有可选的通知都已选中，则取消选中；否则全选
    const allSelected = selectableIds.every(id => selected.includes(id));
    setSelected((prev) => 
      allSelected 
        ? prev.filter(id => !selectableIds.includes(id)) 
        : Array.from(new Set([...prev, ...selectableIds]))
    );
  }
  function clearSelected() { setSelected([]); }

  async function markRead(ids: number[]) {
    if (!ids.length) return;
    await apiRequest("/api/system-notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids })
    });
    await fetchNotifications();
    clearSelected();
  }
  async function deleteNotifications(ids: number[]) {
    if (!ids.length) return;
    await apiRequest("/api/system-notifications/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids })
    });
    await fetchNotifications();
    clearSelected();
  }

  if (loading) {
    return (
      <UserHeader>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-2 pb-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">{t("loading")}</p>
          </div>
        </div>
      </UserHeader>
    );
  }
  
  if (error) {
    return (
      <UserHeader>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-2 pb-16">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-medium text-red-800 mb-2">{t("loading")}</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </UserHeader>
    );
  }

  return (
    <UserHeader>
      <div className="min-h-screen bg-gray-50 pt-2 pb-16 w-full">
        <div className="w-full px-2 sm:px-4">
          <div className="max-w-4xl mx-auto">
            {/* 标题 */}
            <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">{t("title")}</h1>
            
            {notifications.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-gray-400 text-base sm:text-lg">{t("no_notification")}</p>
              </div>
            ) : (
              <>
                {/* 操作按钮组 */}
                <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <button
                      className="px-3 sm:px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-xs sm:text-sm font-medium transition shadow-sm"
                      onClick={() => markRead(notifications.filter(n => !n.read).map(n => n.id))}
                      disabled={notifications.every(n => n.read)}
                    >
                      <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t("mark_all_read")}
                    </button>
                    
                    <button
                      className="px-3 sm:px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs sm:text-sm font-medium transition"
                      onClick={selectAllOnPage}
                    >
                      <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {paged.filter(n => n.userId != null).every(n => selected.includes(n.id)) ? t("deselect_all") : t("select_all")}
                    </button>
                    
                    <button
                      className="px-3 sm:px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-xs sm:text-sm font-medium transition"
                      onClick={clearSelected}
                      disabled={selected.length === 0}
                    >
                      <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {t("clear_selection")} ({selected.length})
                    </button>
                    
                    <button
                      className="px-3 sm:px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-xs sm:text-sm font-medium transition shadow-sm"
                      onClick={() => markRead(selected)}
                      disabled={selected.length === 0}
                    >
                      <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t("mark_read")}
                    </button>
                    
                    <button
                      className="px-3 sm:px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-xs sm:text-sm font-medium transition shadow-sm"
                      onClick={() => deleteNotifications(selected)}
                      disabled={selected.length === 0}
                    >
                      <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {t("delete")}
                    </button>
                  </div>
                </div>

                {/* 通知列表 */}
                <ul className="space-y-3 sm:space-y-4">
                  {paged.map((n) => (
                    <li key={n.id} className={`flex items-start gap-3 p-4 rounded-lg shadow-sm border transition-all ${n.read ? "bg-white border-gray-200" : "bg-blue-50 border-blue-200"} hover:shadow-md`}>
                      <input
                        type="checkbox"
                        checked={selected.includes(n.id)}
                        onChange={() => toggleSelect(n.id)}
                        className="mt-1 accent-blue-500 w-5 h-5 cursor-pointer"
                        disabled={n.userId == null}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {!n.read && (
                            <span className="flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                          )}
                          <span className={`font-semibold text-base sm:text-lg ${n.read ? "text-gray-600" : "text-blue-700"}`}>{n.title}</span>
                          {n.type && (
                            <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 font-medium">
                              {n.type}
                            </span>
                          )}
                        </div>
                        <div className="text-gray-700 whitespace-pre-line mb-2 text-sm sm:text-base break-words leading-relaxed">{n.content}</div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(n.createdAt).toLocaleString(locale)}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {!n.read && (
                          <button
                            className="text-xs sm:text-sm text-green-600 hover:text-green-700 font-medium hover:underline whitespace-nowrap"
                            onClick={() => markRead([n.id])}
                          >
                            ✓ {t("mark_read")}
                          </button>
                        )}
                        {n.userId != null && (
                          <button
                            className="text-xs sm:text-sm text-red-500 hover:text-red-600 font-medium hover:underline whitespace-nowrap"
                            onClick={() => deleteNotifications([n.id])}
                          >
                            ✕ {t("delete")}
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                {/* 分页控制 */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-6 sm:mt-8 bg-white rounded-lg shadow-sm p-4">
                    <button
                      className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      {t('prev')}
                    </button>
                    <span className="text-sm sm:text-base text-gray-600 font-medium">
                      {page} / {totalPages}
                    </span>
                    <button
                      className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      {t('next')}
                      <svg className="w-4 h-4 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </UserHeader>
  );
}
