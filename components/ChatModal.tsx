"use client";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

interface ChatModalProps {
  open: boolean;
  onClose: () => void;
  sellerId: number;
  itemId?: number;
  itemTitle?: string;
  imageUrl?: string;
  messagesTObj?: Record<string, string>;
  sellerName?: string;
}

interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  createdAt: string;
  itemTitle?: string;
  itemId?: number;
  imageUrl?: string;
}

export default function ChatModal({ open, onClose, sellerId, itemId, itemTitle, imageUrl, messagesTObj, sellerName }: ChatModalProps) {
  // 优先用 props 里的多语言对象
  const t = messagesTObj ? (key: string) => messagesTObj[key] || key : useTranslations('Messages');
  const locale = useLocale();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState(itemTitle ? `${t('about_item')}: ${itemTitle} ` : '');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/messages?with=${sellerId}`);
        if (res.status === 401) {
          window.location.href = '/users/profile';
          return;
        }
        const data = await res.json();
        setMessages(data);
      } catch {
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, [open, sellerId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    setIsSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          receiverId: sellerId,
          itemId,
          itemTitle
        })
      });
      if (!res.ok) throw new Error('发送失败');
      const msg = await res.json();
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
    } catch {}
    setIsSending(false);
  };

  // 获取最新一条带 itemId 的消息（优先当前会话的商品信息）
  let displayItemId = itemId;
  let displayItemTitle = itemTitle;
  let displayImageUrl = imageUrl;
  // 优先用 props 传入，其次查找 messages 里最新一条有商品信息的消息（不区分谁发的）
  if ((!displayItemId || !displayItemTitle || !displayImageUrl) && messages && messages.length > 0) {
    const latestMsgWithItem = [...messages].reverse().find(m => m.itemId && m.itemTitle && m.imageUrl);
    if (latestMsgWithItem) {
      displayItemId = latestMsgWithItem.itemId;
      displayItemTitle = latestMsgWithItem.itemTitle;
      displayImageUrl = latestMsgWithItem.imageUrl;
    }
  }

  // 获取对方昵称，优先用 props 传入的 sellerName，否则用消息中最新一条对方的名字
  let displayName = sellerName;
  if (!displayName && messages && messages.length > 0) {
    const latestMsgFromSeller = [...messages].reverse().find(m => m.senderId === sellerId);
    if (latestMsgFromSeller && (latestMsgFromSeller as any).senderName) {
      displayName = (latestMsgFromSeller as any).senderName;
    }
  }

  useEffect(() => {
    if (!open) return;
    // 监听物理返回键（如安卓、浏览器返回）只关闭弹窗，不退回上一页
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault?.();
      onClose();
      window.history.replaceState(null, '', window.location.href); // 防止多次回退
    };
    window.addEventListener('popstate', handlePopState);
    // 弹窗打开时 push 一个新 state
    window.history.pushState({ chatModalOpen: true }, '');
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [open, onClose]);

  // 关闭弹窗时，pop 掉 history 的 chatModalOpen state
  const handleClose = () => {
    if (window.history.state && window.history.state.chatModalOpen) {
      window.history.back();
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40">
      <div className="bg-white w-screen h-screen max-w-full max-h-full flex flex-col rounded-none shadow-none sm:rounded-xl sm:shadow-lg sm:w-full sm:max-w-md sm:mx-auto sm:max-h-[90vh]">
        {/* 头部 */}
        <div className="flex flex-col border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center flex-1">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm font-semibold">S</span>
              </div>
              <h3 className="font-semibold text-gray-900">{displayName || t('chat_with_seller')}</h3>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {displayItemId && displayItemTitle && displayImageUrl && (
            <a
              href={`/${locale}/items/${displayItemId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 pb-2 hover:bg-gray-100 rounded transition"
              style={{ textDecoration: 'none' }}
            >
              <img
                src={displayImageUrl}
                alt={displayItemTitle}
                className="w-12 h-12 object-cover rounded mr-3 border"
                style={{ background: '#f3f4f6' }}
                onError={e => (e.currentTarget.style.display = 'none')}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {displayItemTitle}
                </div>
              </div>
            </a>
          )}
        </div>
        {/* 消息列表 */}
        <div className="flex-1 px-3 py-4 overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="text-center text-gray-400 py-8">{t('loading')}</div>
          ) : !Array.isArray(messages) || messages.length === 0 ? (
            <div className="text-center text-gray-400 py-8">{t('no_conversations')}</div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.senderId === sellerId ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl ${msg.senderId === sellerId ? 'bg-gray-200 text-gray-900 rounded-bl-md' : 'bg-blue-500 text-white rounded-br-md'}`}>
                  {msg.itemTitle && (
                    <p className="text-xs opacity-75 mb-1">{t('about_item')}: {msg.itemTitle}</p>
                  )}
                  <p className="text-base leading-relaxed">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.senderId === sellerId ? 'text-gray-500' : 'text-blue-100'}`}>{new Date(msg.createdAt).toLocaleString(locale === 'zh' ? 'zh-CN' : locale === 'ja' ? 'ja-JP' : 'en-US')}</p>
                </div>
              </div>
            ))
          )}
        </div>
        {/* 输入框 */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-end space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder={t('type_message')}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              onKeyPress={e => e.key === 'Enter' && sendMessage()}
              disabled={isSending}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isSending}
              className="w-12 h-12 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
