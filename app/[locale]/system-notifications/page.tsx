"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useCombinedAuth } from "@/hooks/useCombinedAuth";
import UserHeader from '../../../components/UserHeader';

interface Notification {
  id: number;
  title: string;
  content: string;
  type?: string;
  read: boolean;
  createdAt: string;
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
      const res = await fetch("/api/system-notifications");
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
    const ids = paged.map(n => n.id);
    setSelected((prev) => ids.every(id => prev.includes(id)) ? prev.filter(id => !ids.includes(id)) : Array.from(new Set([...prev, ...ids])));
  }
  function clearSelected() { setSelected([]); }

  async function markRead(ids: number[]) {
    if (!ids.length) return;
    await fetch("/api/system-notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids })
    });
    await fetchNotifications();
    clearSelected();
  }
  async function deleteNotifications(ids: number[]) {
    if (!ids.length) return;
    await fetch("/api/system-notifications/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids })
    });
    await fetchNotifications();
    clearSelected();
  }

  if (loading) return <UserHeader><div className="p-8 text-center text-gray-500">{t("loading")}</div></UserHeader>;
  if (error) return <UserHeader><div className="p-8 text-center text-red-500">{error}</div></UserHeader>;

  return (
    <UserHeader>
      <div className="max-w-lg mx-auto p-2 sm:p-4">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center">{t("title")}</h1>
        {notifications.length === 0 ? (
          <div className="text-gray-400 text-center py-12">{t("no_notification")}</div>
        ) : (
          <>
            <div className="flex flex-wrap items-center mb-2 gap-2 justify-center">
              <button
                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 text-sm font-medium"
                onClick={() => markRead(notifications.filter(n => !n.read).map(n => n.id))}
                disabled={notifications.every(n => n.read)}
              >
                {t("mark_all_read")}
              </button>
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm font-medium"
                onClick={clearSelected}
                disabled={selected.length === 0}
              >
                {t("delete")}/{t("mark_read")} {selected.length}
              </button>
              <button
                className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-300 text-sm font-medium"
                onClick={() => markRead(selected)}
                disabled={selected.length === 0}
              >
                {t("mark_read")}
              </button>
              <button
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-300 text-sm font-medium"
                onClick={() => deleteNotifications(selected)}
                disabled={selected.length === 0}
              >
                {t("delete")}
              </button>
              <button
                className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm font-medium"
                onClick={selectAllOnPage}
              >
                {paged.every(n => selected.includes(n.id)) ? t("delete") + "/" + t("mark_read") + " " + t("read") : t("mark_all_read")}
              </button>
            </div>
            <ul className="space-y-3">
              {paged.map((n) => (
                <li key={n.id} className={`flex items-start gap-2 p-3 rounded-xl shadow-sm border ${n.read ? "bg-gray-50" : "bg-yellow-50"}`}>
                  <input
                    type="checkbox"
                    checked={selected.includes(n.id)}
                    onChange={() => toggleSelect(n.id)}
                    className="mt-1 accent-blue-500 w-4 h-4"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-semibold truncate ${n.read ? "text-gray-400" : "text-blue-600"}`}>{n.title}</span>
                      {n.type && <span className="text-xs bg-gray-200 rounded px-2 py-0.5 ml-2">{n.type}</span>}
                    </div>
                    <div className="text-gray-700 whitespace-pre-line mb-1 text-sm break-words">{n.content}</div>
                    <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString(locale)}</div>
                  </div>
                  <div className="flex flex-col gap-1 ml-2">
                    {!n.read && (
                      <button
                        className="text-xs text-green-600 hover:underline"
                        onClick={() => markRead([n.id])}
                      >{t("mark_read")}</button>
                    )}
                    <button
                      className="text-xs text-red-500 hover:underline"
                      onClick={() => deleteNotifications([n.id])}
                    >{t("delete")}</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center mt-4 gap-2">
              <button
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm font-medium"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                &lt; {t('prev')}
              </button>
              <span className="text-sm text-gray-500">{page} / {totalPages}</span>
              <button
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm font-medium"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                {t('next')} &gt;
              </button>
            </div>
          </>
        )}
      </div>
    </UserHeader>
  );
}
