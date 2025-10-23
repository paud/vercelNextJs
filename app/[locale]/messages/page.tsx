"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import UserHeader from '../../../components/UserHeader';

interface Message {
  id: number;
  content: string;
  senderName: string;
  senderId: number;
  receiverId: number;
  createdAt: string;
  isRead: boolean;
  itemTitle?: string;
  itemId?: number;
}

interface Conversation {
  userId: number;
  userName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('Messages');
  const { user: currentUser } = useCurrentUser();

  // 关闭聊天窗口的函数
  const closeChatWindow = () => {
    setIsChatOpen(false);
    // 如果当前历史记录状态是聊天窗口，则回到之前的状态
    if (window.history.state?.chatOpen) {
      window.history.back();
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser]);

  // 防止页面滚动和管理浏览器历史记录
  useEffect(() => {
    if (isChatOpen) {
      // 阻止页面滚动
      document.body.style.overflow = 'hidden';
      
      // 向历史记录添加一个状态，用于处理返回按钮
      window.history.pushState({ chatOpen: true }, '');
      
      // 监听浏览器返回事件
      const handlePopState = (event: PopStateEvent) => {
        setIsChatOpen(false);
      };
      
      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isChatOpen]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/messages/conversations');
      const data = await response.json();
      // data: [{ userId, lastMessage, unread }]
      const conversations: Conversation[] = await Promise.all(
        data.map(async (item: any) => {
          return {
            userId: item.userId,
            userName: item.userName, // 使用后端返回的用户名
            lastMessage: item.lastMessage.content || '',
            lastMessageTime: item.lastMessage.createdAt,
            unreadCount: item.unread,
            messages: [item.lastMessage], // 只放最后一条消息，点开后再请求全部消息
          };
        })
      );
      setConversations(conversations);
    } catch (error) {
      console.error('获取会话失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取所有未读消息总数
  const fetchUnreadTotal = async () => {
    try {
      const res = await fetch('/api/messages/unread');
      const data = await res.json();
      // unread.ts 返回的是 [{ senderId, _count: { _all: number } }, ...]
      const total = Array.isArray(data) ? data.reduce((sum, u) => sum + (u._count?._all || 0), 0) : 0;
      setUnreadTotal(total);
    } catch {
      setUnreadTotal(0);
    }
  };

  // 拉取完整消息历史
  const fetchMessagesWithUser = async (userId: number) => {
    try {
      const res = await fetch(`/api/messages?with=${userId}`);
      const data = await res.json();
      return data;
    } catch {
      return [];
    }
  };

  // 标记消息为已读
  const markAsRead = async (userId: number) => {
    try {
      await fetch('/api/messages/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withUserId: userId })
      });
    } catch {}
  };

  // 页面加载时获取未读总数
  useEffect(() => {
    fetchUnreadTotal();
  }, []);

  // 打开会话时拉取历史并标记为已读
  const handleOpenConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    const messages = await fetchMessagesWithUser(conversation.userId);
    setSelectedConversation(prev => prev ? { ...prev, messages } : null);
    await markAsRead(conversation.userId);
    fetchUnreadTotal(); // 刷新未读总数
    fetchConversations(); // 刷新会话列表未读数
    setIsChatOpen(true);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    try {
      setIsSending(true);

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          receiverId: selectedConversation.userId
        })
      });

      if (!response.ok) throw new Error('发送失败');
      const newMsg = await response.json();

      setSelectedConversation(prev => ({
        ...prev!,
        messages: [...prev!.messages, newMsg],
        lastMessage: newMsg.content,
        lastMessageTime: newMsg.createdAt
      }));

      setNewMessage('');
    } catch (error) {
      console.error('发送消息失败:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString(locale === 'zh' ? 'zh-CN' : locale === 'ja' ? 'ja-JP' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : locale === 'ja' ? 'ja-JP' : 'en-US');
    }
  };

  if (isLoading) {
    return (
      <UserHeader>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('loading')}</p>
          </div>
        </div>
      </UserHeader>
    );
  }

  return (
    <UserHeader>
      <div className="min-h-screen bg-gray-50 pt-2 pb-16">
        <div className="mx-auto px-2 sm:px-4 py-4 sm:py-6">
          {/* 页面标题 */}
          <div className="mb-4 sm:mb-8">
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 text-center">{t('title')}
              {unreadTotal > 0 && (
                <span className="ml-2 text-base text-red-500 align-middle">({unreadTotal})</span>
              )}
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-base sm:text-lg text-center">{t('subtitle')}</p>
          </div>

          {/* 手机端会话列表 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">{t('conversations')}</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {conversations.length === 0 ? (
                <div className="p-8 sm:p-12 text-center text-gray-500">
                  <svg className="w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-base sm:text-lg">{t('no_conversations')}</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.userId}
                    className="px-4 sm:px-5 py-3 sm:py-4 active:bg-gray-100 transition-colors"
                    onClick={() => handleOpenConversation(conversation)}
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      {/* 用户头像 */}
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-base sm:text-lg font-bold">
                          {conversation.userName ? conversation.userName.charAt(0) : '?'}
                        </span>
                      </div>
                      {/* 消息内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{conversation.userName}</h3>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            {conversation.unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-medium">
                                {conversation.unreadCount}
                              </span>
                            )}
                            <span className="text-xs sm:text-sm text-gray-400">{formatTime(conversation.lastMessageTime)}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 truncate text-xs sm:text-base">{conversation.lastMessage}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 手机端聊天窗口 - 确保在Footer之上 */}
        {isChatOpen && selectedConversation && (
          <div className="fixed inset-0 z-[100] bg-white animate-slideUp chat-modal">
            <div className="h-full flex flex-col">
              {/* 聊天窗口头部 */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                <button
                  onClick={closeChatWindow}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex items-center flex-1 ml-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-semibold">
                      {selectedConversation.userName ? selectedConversation.userName.charAt(0) : '?'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{selectedConversation.userName}</h3>
                </div>
              </div>

              {/* 消息列表 */}
              <div className="flex-1 px-3 py-4 overflow-y-auto space-y-3">
                {selectedConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === Number(currentUser?.id) ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-2xl ${
                        message.senderId === Number(currentUser?.id)
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-gray-200 text-gray-900 rounded-bl-md'
                      }`}
                    >
                      {message.itemTitle && (
                        <p className="text-xs opacity-75 mb-1">
                          {t('about_item')}: {message.itemTitle}
                        </p>
                      )}
                      <p className="text-base leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === Number(currentUser?.id) ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 手机端消息输入框 */}
              <div className="p-4 border-t border-gray-200 bg-white" style={{ paddingBottom: 'env(safe-area-inset-bottom, 1rem)' }}>
                <div className="flex items-end space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('type_message')}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
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
        )}
      </div>
    </UserHeader>
  );
}
