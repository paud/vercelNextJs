"use client";

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useCurrentUser } from '../../../../hooks/useCurrentUser';
import UserHeader from '../../../../components/UserHeader';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Dialog } from '@headlessui/react';

interface UserInfo {
  id: number;
  username: string;
  email: string;
  name: string | null;
  phone: string | null;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  const locale = useLocale();
  const t = useTranslations('Profile');
  const { user: currentUser, setCurrentUser } = useCurrentUser();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/${locale}/auth/signin`);
    }
  }, [status, router, locale]);

  useEffect(() => {
    if (!currentUser) return; // UserHeader 已经处理了认证检查

    setEditData({
      name: currentUser.name || '',
      email: currentUser.email || '',
      phone: '', // Google 登录用户可能没有 phone 字段
    });
  }, [currentUser]);

  const handleEdit = () => {
    setIsEditing(true);
    setMessage('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
    });
    setMessage('');
  };

  const handleSave = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          name: editData.name.trim(),
          email: editData.email.trim(),
          phone: editData.phone.trim(),
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setCurrentUser && setCurrentUser(updatedUser); // 立即同步前端 currentUser
        // 同步 userInfo cookie
        document.cookie = `userInfo=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/;`;
        setIsEditing(false);
        setMessage(t('update_success'));
        setIsSuccess(true);
        setTimeout(() => setMessage(''), 3000);
        // 去掉页面自动刷新
      } else {
        const errorData = await response.json();
        if (response.status === 409) {
          setMessage(t('email_exists_error'));
        } else if (response.status === 400) {
          setMessage(t('email_format_error'));
        } else {
          setMessage(t('update_error'));
        }
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('更新用户信息时出错:', error);
      setMessage(t('update_error'));
      setIsSuccess(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentUser) {
      setPasswordMsg(t('change_password_fail'));
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg(t('change_password_min_length'));
      return;
    }
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, password: newPassword })
      });
      if (response.ok) {
        setPasswordMsg(t('change_password_success'));
        setNewPassword('');
        setIsPasswordDialogOpen(false);
      } else {
        setPasswordMsg(t('change_password_fail'));
      }
    } catch {
      setPasswordMsg(t('change_password_fail'));
    }
  };

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return null;

  return (
    <UserHeader>
      <div className="min-h-screen bg-gray-50 pb-16 pt-2">
        {/* 主内容区域 */}
        <div className="py-4 mb-6">
          <div className="max-w-sm w-full mx-auto px-2 sm:px-4">
            {/* 页面标题 */}
            <div className="mb-4 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">{t('title')}</h1>
            </div>

            {/* 消息提示 */}
            {message && (
              <div className={`mb-4 sm:mb-6 p-4 rounded-lg ${isSuccess ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {message}
              </div>
            )}

            {/* 个人资料卡片 */}
            {currentUser && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* 卡片头部 */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-6">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 text-xl font-bold">
                      {(currentUser.name || currentUser.username || '').charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4 text-white">
                      <h2 className="text-lg sm:text-2xl font-bold">{currentUser.name || currentUser.username || ''}</h2>
                      <p className="text-blue-100 text-sm">@{currentUser.username || ''}</p>
                      <p className="text-blue-100 text-xs sm:text-sm">{t('member_since')} {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString(locale === 'zh' ? 'zh-CN' : locale === 'ja' ? 'ja-JP' : 'en-US') : '--'}</p>
                    </div>
                  </div>
                </div>

                {/* 卡片内容 */}
                <div className="px-4 py-4 sm:px-6 sm:py-6">
                  <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">{t('basic_info')}</h3>
                    {!isEditing && (
                      <button
                        onClick={handleEdit}
                        className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {t('edit')}
                      </button>
                    )}
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {/* 用户名 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('username')}
                      </label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 818 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-gray-900">{currentUser.username || ''}</span>
                        <span className="ml-auto text-xs text-gray-500">{t('username_readonly')}</span>
                      </div>
                    </div>

                    {/* 邮箱 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('email')}
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editData.email}
                          onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={t('email_placeholder')}
                        />
                      ) : (
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                          <span className="text-gray-900">{currentUser.email}</span>
                        </div>
                      )}
                    </div>

                    {/* 姓名 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('name')}
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={t('name_placeholder')}
                        />
                      ) : (
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-900">{currentUser.name || t('no_name')}</span>
                        </div>
                      )}
                    </div>

                    {/* 电话 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('phone')}
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editData.phone}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={t('phone_placeholder')}
                        />
                      ) : (
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-gray-900">{currentUser.phone || t('no_phone')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 编辑模式的按钮 */}
                  {isEditing && (
                    <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                      >
                        {t('cancel')}
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        {t('save')}
                      </button>
                    </div>
                  )}
                  {currentUser?.username && (
                    <>
                      <button
                        className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-lg"
                        onClick={() => setIsPasswordDialogOpen(true)}
                      >{t('change_password')}</button>
                      <Dialog open={isPasswordDialogOpen} onClose={() => setIsPasswordDialogOpen(false)}>
                        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                            <h3 className="text-lg font-bold mb-4">{t('change_password_title')}</h3>
                            <input
                              type="password"
                              className="w-full border rounded px-3 py-2 mb-3"
                              placeholder={t('change_password_input')}
                              value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                            />
                            <div className="text-red-500 text-sm mb-2">{passwordMsg}</div>
                            <div className="flex justify-end gap-2">
                              <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setIsPasswordDialogOpen(false)}>{t('change_password_cancel')}</button>
                              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handlePasswordChange}>{t('change_password_save')}</button>
                            </div>
                          </div>
                        </div>
                      </Dialog>
                    </>
                  )}
                {/* 卡片内容结束 */}
                </div>
              {/* 卡片结束 */}
              </div>
            )}</div>
        </div>
      </div>
    </UserHeader>
  );
}
