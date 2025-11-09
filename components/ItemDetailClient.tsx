"use client";
import { useState, useEffect, useCallback } from "react";
import ChatModal from "@/components/ChatModal";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import React from "react";
import Image from "next/image";
import { SiX } from "react-icons/si";
import { signIn, useSession } from 'next-auth/react';
import type { Session } from 'next-auth';

function SkeletonDetail() {
  return (
    <div className="w-full p-3 sm:p-6 bg-gray-200 animate-pulse rounded-lg shadow mt-2 mb-16 min-h-screen flex flex-col justify-start">
      <div className="w-full h-40 sm:h-64 bg-gray-300 rounded mb-3 sm:mb-4" />
      <div className="h-7 bg-gray-300 rounded mb-2 w-2/3" />
      <div className="h-6 bg-gray-300 rounded mb-2 w-1/2" />
      <div className="h-5 bg-gray-300 rounded mb-2 w-1/3" />
      <div className="h-4 bg-gray-300 rounded mb-2 w-1/4" />
      <div className="h-4 bg-gray-300 rounded w-full mb-3" />
      <div className="h-4 bg-gray-300 rounded w-full mb-3" />
      <div className="h-4 bg-gray-300 rounded w-full mb-3" />
    </div>
  );
}

export default function ItemDetailClient({ item, tObj, homeTObj, messagesTObj }: { item: any, tObj: Record<string, string>, homeTObj: Record<string, string>, messagesTObj: Record<string, string> }) {
  const [showChat, setShowChat] = useState(false);
  const [comments, setComments] = useState<Array<{ id: number; user: string; userId: number | null; content: string; createdAt: string }>>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const { isLoggedIn, isLoading } = useCurrentUser();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const { data: session, status } = useSession() as { data: Session | null, status: string };
  // 简单 t 函数
  const t = (k: string) => tObj[k] || k;
  const homeT = (k: string) => homeTObj[k] || k;
  const handleContactClick = () => {
    if (isLoading) return; // 用户信息未加载完成时不响应点击
    if (!isLoggedIn) {
      window.location.href = '/users/profile';
    } else {
      setShowChat(true);
    }
  };
  useEffect(() => {
    // 仅在微信小程序环境下执行
    function isWechatMiniProgramWebview() {
      // 微信小程序 webview 环境判断
      // 通过 userAgent 或 window.__wxjs_environment 检测
      if (typeof window !== 'undefined') {
        if (window.__wxjs_environment === 'miniprogram') return true;
        if (navigator.userAgent.includes('miniProgram')) return true;
        // 兼容部分微信小程序 UA
        if (/MicroMessenger/i.test(navigator.userAgent) && /miniprogram/i.test(navigator.userAgent)) return true;
      }
      return false;
    }
    if (isWechatMiniProgramWebview()) {
      // 记录当前用户所处的URL和用户ID
      if (session?.user && typeof window !== 'undefined')  {
        const userId = session.user.id;
        const currentUrl = window.location.href;
        const code = localStorage.getItem('wechat_miniprogram_code') || null;
        // 可根据实际需求将数据发送到后端或存储
        fetch('/api/user-location-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, url: currentUrl, code, title: item?.title }),
        });
      }
    }
    // 获取当前用户ID（假设后端有API或全局变量）
    fetch('/api/users/profile').then(res => res.ok ? res.json() : null).then(data => {
      if (data && data.id) {
        setCurrentUserId(data.id);
        console.log('当前用户ID:', data.id);
      } else {
        console.log('未获取到当前用户ID');
      }
    });
    // 获取评论
    fetch(`/api/items/${item.id}/comments`).then(res => res.ok ? res.json() : []).then(data => setComments(data));
  }, [item.id]);
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentLoading(true);
    const res = await fetch(`/api/items/${item.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentText })
    });
    if (res.ok) {
      setCommentText("");
      const data = await res.json();
      setComments([data, ...comments]);
    }
    setCommentLoading(false);
  };
  const handleDeleteComment = async (commentId: number) => {
    if (!currentUserId) return;
    const res = await fetch(`/api/items/${commentId}/comments`, {
      method: "DELETE",
    });
    if (res.ok) {
      setComments(comments.filter(c => c.id !== commentId));
    }
  };
  // 递归渲染嵌套评论
  const renderComments = (comments: any[], level = 0) => (
    <ul className={level === 0 ? "mb-4" : "ml-6 mt-2"}>
      {comments.map(c => (
        <li key={c.id} className="mb-2 p-2 bg-gray-50 rounded">
          <div className="text-sm font-semibold text-blue-700">{c.user}</div>
          <div className="text-gray-800 text-base">{c.content}</div>
          <div className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString(homeT('date_locale'))}</div>
          {currentUserId !== null && c.userId !== null && Number(c.userId) === Number(currentUserId) && (
            <button onClick={() => handleDeleteComment(c.id)} className="text-red-500 text-xs mt-1">删除</button>
          )}
          {isLoggedIn && (
            <button onClick={() => setReplyingId(c.id)} className="text-blue-500 text-xs ml-2">{t('reply')}</button>
          )}
          {replyingId === c.id && (
            <form onSubmit={async e => {
              e.preventDefault();
              if (!replyText.trim()) return;
              setReplyLoading(true);
              const res = await fetch(`/api/items/${item.id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: replyText, parentId: c.id })
              });
              if (res.ok) {
                setReplyText("");
                setReplyingId(null);
                // 重新获取评论
                fetch(`/api/items/${item.id}/comments`).then(res => res.ok ? res.json() : []).then(data => setComments(data));
              }
              setReplyLoading(false);
            }} className="flex flex-col gap-2 mt-2">
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                className="flex-1 px-3 py-2 border rounded text-base resize-vertical"
                placeholder={t('reply_comment')}
                disabled={replyLoading}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              <div className="flex gap-2">
                <button type="submit" className="px-3 py-2 bg-blue-500 text-white rounded" disabled={replyLoading || !replyText.trim()}>{replyLoading ? t('submitting') : t('submit_reply')}</button>
                <button type="button" className="px-3 py-2 bg-gray-300 text-gray-700 rounded" onClick={() => { setReplyingId(null); setReplyText(""); }}>{t('cancel')}</button>
              </div>
            </form>
          )}
          {c.replies && c.replies.length > 0 && renderComments(c.replies, level + 1)}
        </li>
      ))}
    </ul>
  );
  const shareToX = () => {
    const url = typeof window !== "undefined" ? encodeURIComponent(window.location.href) : "";
    const text = encodeURIComponent(item.title + ' - ￥' + item.price);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank");
  };
  if (!item) {
    return <SkeletonDetail />;
  }
  return (
    <>
      <div className="w-full p-3 sm:p-6 bg-white rounded-lg shadow mt-2 mb-16 min-h-screen flex flex-col justify-start">
        {item.imageUrl && (
          <Image
            src={item.imageUrl.split('?')[0]}
            alt={item.title}
            width={400}
            height={256}
            className="w-full h-auto object-contain rounded mb-3 sm:mb-4"
            style={{ width: '100%', height: 'auto', display: 'block', maxWidth: '100%' }}
            loading="lazy"
          />
        )}
        <h1 className="text-xl sm:text-2xl font-bold mb-2">{item.title}</h1>
        <p className="text-lg text-blue-600 font-semibold mb-2">￥{item.price}</p>
        <button
          className="w-full mb-2 py-2 bg-yellow-400 text-gray-900 rounded-lg font-semibold hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2 shadow-md border border-yellow-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          style={{ fontSize: '1.1rem', letterSpacing: '0.02em' }}
          onClick={handleContactClick}
          disabled={isLoading}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {isLoading ? '...' : t('contact_seller')}
        </button>

        {/* LINE分享按钮 */}
        <button
          className="w-full mb-2 py-2 bg-[#06C755] text-white rounded-lg font-semibold hover:bg-[#05b74f] transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#06C755] focus:ring-offset-2"
          onClick={() => {
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
            const itemUrl = `${baseUrl}/items/${item.id}`;
            const lineShareUrl = `https://line.me/R/share?text=${encodeURIComponent(item.title + ' - ' + homeT('currency') + item.price + '\n' + itemUrl)}`;
            window.open(lineShareUrl, '_blank');
          }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.771.039 1.086l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
          </svg>
          {t('share_to_line')}
        </button>
        {/* X (Twitter) 分享按钮 */}
        <button
          className="w-full mb-2 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          onClick={shareToX}
        >
          <SiX className="w-5 h-5 mr-2" color="#fff" />
          {t('share_to_x')}
        </button>
        {isLoggedIn && (
          <ChatModal
            open={showChat}
            onClose={() => setShowChat(false)}
            sellerId={item.sellerId}
            itemId={item.id}
            itemTitle={item.title}
            imageUrl={item.imageUrl || undefined}
            messagesTObj={messagesTObj}
            sellerName={item.seller?.name || undefined}
          />
        )}
        <p className="text-gray-700 mb-3 sm:mb-4">{item.description || homeT('no_description')}</p>
        <div className="text-sm text-gray-500">
          {t('seller')}：{item.seller?.name || t('anonymous')} <br />
          {t('contact')}：{item.seller?.email || t('no_contact')}
        </div>
        <div className="text-xs text-gray-400 mt-3 sm:mt-4">
          {t('published_at')}：{new Date(item.createdAt).toLocaleString(homeT('date_locale'))}
        </div>
        {/* Google Translate Widget 按钮恢复到评论标题右侧最边边 */}
        <div className="flex items-center justify-between mt-8 mb-2">
          <h2 className="text-lg font-bold">{t('comments')}</h2>
        </div>
        {comments.length === 0 && <div className="text-gray-400 mb-2">{t('no_comments')}</div>}
        {renderComments(comments)}
        {isLoggedIn ? (
          <form onSubmit={handleCommentSubmit} className="flex flex-col gap-2 items-stretch">
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              className="flex-1 px-3 py-4 border rounded text-base resize-vertical"
              placeholder={t('add_comment')}
              disabled={commentLoading}
              style={{ minHeight: '64px', maxHeight: '200px' }}
            />
            <button type="submit" className="w-full px-4 py-3 bg-blue-500 text-white rounded mt-1" disabled={commentLoading || !commentText.trim()}>
              {commentLoading ? t('submit_comment') : t('post_comment')}
            </button>
          </form>
        ) : (
          <div className="text-red-500">{t('login_required_detail')}</div>
        )}
        {/* Google Translate Widget 移除 */}
      </div>
    </>
  );
}
