"use client";
import { useState, useEffect } from "react";
import ChatModal from "@/components/ChatModal";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import React from "react";
import Image from "next/image";

function SkeletonDetail() {
  return (
    <div className="max-w-sm w-full mx-auto p-3 sm:p-6 bg-gray-200 animate-pulse rounded-lg shadow mt-2 mb-16 min-h-screen flex flex-col justify-start">
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
  const [comments, setComments] = useState<Array<{id:number;user:string;userId:number|null;content:string;createdAt:string}>>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const { isLoggedIn, isLoading } = useCurrentUser();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [replyingId, setReplyingId] = useState<number|null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
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
  if (!item) {
    return <SkeletonDetail />;
  }
  return (
    <div className="max-w-sm w-full mx-auto p-3 sm:p-6 bg-white rounded-lg shadow mt-2 mb-16 min-h-screen flex flex-col justify-start">
      {item.imageUrl && (
        <Image
          src={item.imageUrl}
          alt={item.title}
          width={400}
          height={256}
          className="w-full h-40 sm:h-64 object-cover rounded mb-3 sm:mb-4"
          loading="lazy"
        />
      )}
      <h1 className="text-xl sm:text-2xl font-bold mb-2">{item.title}</h1>
      <p className="text-lg text-blue-600 font-semibold mb-2">{homeT('currency')}{item.price}</p>
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
      <div className="mt-8">
        <h2 className="text-lg font-bold mb-2">{t('comments')}</h2>
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
      </div>
    </div>
  );
}
