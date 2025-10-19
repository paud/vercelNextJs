"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import UserHeader from '../../../components/UserHeader';

// 手机端优化的CSS动画样式
const styles = `
  @keyframes slideUp {
    from { 
      transform: translateY(100%); 
    }
    to { 
      transform: translateY(0); 
    }
  }
  
  .animate-slideUp {
    animation: slideUp 0.3s ease-out;
  }
`;

// 将样式插入到文档中
if (typeof document !== 'undefined' && !document.getElementById('chat-modal-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'chat-modal-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

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
  
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('Messages');
  const { user: currentUser } = useCurrentUser();

  useEffect(() => {
    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser]);

  // 防止页面滚动
  useEffect(() => {
    if (isChatOpen) {
      // 阻止页面滚动
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isChatOpen]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      // 这里模拟获取会话列表的 API 调用
      // const response = await fetch(`/api/users/${currentUser.id}/conversations`);
      // const data = await response.json();
      
      // 模拟数据
      const mockConversations: Conversation[] = [
        {
          userId: 2,
          userName: "张三",
          lastMessage: "这个商品还在吗？",
          lastMessageTime: "2024-01-15T10:30:00Z",
          unreadCount: 2,
          messages: [
            {
              id: 1,
              content: "你好，我想询问一下这个商品",
              senderName: "张三",
              senderId: 2,
              receiverId: Number(currentUser?.id) || 1,
              createdAt: "2024-01-15T10:00:00Z",
              isRead: true,
              itemTitle: "二手自行车",
              itemId: 1
            },
            {
              id: 2,
              content: "这个商品还在吗？",
              senderName: "张三",
              senderId: 2,
              receiverId: Number(currentUser?.id) || 1,
              createdAt: "2024-01-15T10:30:00Z",
              isRead: false
            }
          ]
        },
        {
          userId: 3,
          userName: "李四",
          lastMessage: "好的，谢谢！",
          lastMessageTime: "2024-01-14T16:20:00Z",
          unreadCount: 0,
          messages: [
            {
              id: 3,
              content: "这个价格可以商量吗？",
              senderName: "李四",
              senderId: 3,
              receiverId: Number(currentUser?.id) || 1,
              createdAt: "2024-01-14T16:00:00Z",
              isRead: true,
              itemTitle: "笔记本电脑",
              itemId: 2
            },
            {
              id: 4,
              content: "好的，谢谢！",
              senderName: "李四",
              senderId: 3,
              receiverId: Number(currentUser?.id) || 1,
              createdAt: "2024-01-14T16:20:00Z",
              isRead: true
            }
          ]
        }
      ];
      
      setConversations(mockConversations);
    } catch (error) {
      console.error('获取会话失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    try {
      setIsSending(true);
      
      // 这里应该调用发送消息的 API
      // const response = await fetch('/api/messages', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     content: newMessage,
      //     receiverId: selectedConversation.userId
      //   })
      // });

      // 模拟发送消息
      const newMsg: Message = {
        id: Date.now(),
        content: newMessage,
        senderName: currentUser.username || 'You',
        senderId: Number(currentUser.id),
        receiverId: selectedConversation.userId,
        createdAt: new Date().toISOString(),
        isRead: false
      };

      // 更新本地状态
      setSelectedConversation(prev => ({
        ...prev!,
        messages: [...prev!.messages, newMsg],
        lastMessage: newMessage,
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
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto px-4 py-6">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-gray-600 mt-2 text-lg">{t('subtitle')}</p>
          </div>

          {/* 手机端会话列表 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{t('conversations')}</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {conversations.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <svg className="w-20 h-20 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-lg">{t('no_conversations')}</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.userId}
                    className="px-5 py-4 active:bg-gray-100 transition-colors"
                    onClick={() => {
                      setSelectedConversation(conversation);
                      setIsChatOpen(true);
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      {/* 用户头像 */}
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-lg font-bold">
                          {conversation.userName.charAt(0)}
                        </span>
                      </div>
                      
                      {/* 消息内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{conversation.userName}</h3>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            {conversation.unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-medium">
                                {conversation.unreadCount}
                              </span>
                            )}
                            <span className="text-sm text-gray-400">{formatTime(conversation.lastMessageTime)}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 truncate text-base">{conversation.lastMessage}</p>
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
          <div 
            className="fixed inset-0 z-[100] bg-white animate-slideUp"
            style={{ zIndex: 100 }}
          >
            <div className="h-full flex flex-col">
              {/* 聊天窗口头部 */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex items-center flex-1 ml-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-semibold">
                      {selectedConversation.userName.charAt(0)}
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
