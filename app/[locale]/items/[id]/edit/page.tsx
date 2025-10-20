"use client";

import { useState, useEffect } from "react";
import { upload } from "@vercel/blob/client";
import { useTranslations } from 'next-intl';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCombinedAuth } from '../../../../../hooks/useCombinedAuth';

interface Item {
  id: number;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  sellerId: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function EditItemPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
    const t = useTranslations('ItemEdit');
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [item, setItem] = useState<Item | null>(null);
    const [error, setError] = useState("");
    
    const router = useRouter();
    const [resolvedParams, setResolvedParams] = useState<{ id: string; locale: string } | null>(null);
    const { currentUser, isLoading } = useCombinedAuth();

    useEffect(() => {
        params.then(setResolvedParams);
    }, [params]);

    const fetchItem = async (itemId: string) => {
        try {
            const response = await fetch(`/api/items/${itemId}`);
            if (response.ok) {
                const itemData = await response.json();
                setItem(itemData);
                setTitle(itemData.title);
                setDescription(itemData.description || "");
                setPrice(itemData.price.toString());
                setImageUrl(itemData.imageUrl || "");
            } else {
                setError(t('item_not_found'));
            }
        } catch (error) {
            console.error('获取商品信息失败:', error);
            setError(t('fetch_error'));
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!resolvedParams) return;
        if (isLoading) return; // 等待认证检查完成

        if (!currentUser) {
            router.push(`/${resolvedParams.locale}/auth/signin?callbackUrl=/${resolvedParams.locale}/items/${resolvedParams.id}/edit`);
            return;
        }
        
        fetchItem(resolvedParams.id);
    }, [resolvedParams, currentUser, isLoading, router]);

    // 检查用户权限
    useEffect(() => {
        if (item && currentUser) {
            // 兼容 string 和 number 类型的 ID 比较
            const itemSellerId = item.sellerId?.toString();
            const currentUserId = currentUser.id.toString();
            if (itemSellerId !== currentUserId) {
                setError(t('no_permission'));
            }
        }
    }, [item, currentUser, t]);

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setUploading(true);
        try {
            console.log('Uploading file:', file);
            const { url } = await upload(file.name, file, {
                access: 'public',
                handleUploadUrl: '/api/upload',
            });
            setImageUrl(url);
        } catch (err) {
            console.error('Upload error:', err);
            alert(t('upload_fail'));
        }
        setUploading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title || !price) {
            alert(t('form_incomplete'));
            return;
        }
        
        if (!currentUser || !item) {
            alert(t('invalid_state'));
            return;
        }

        // 兼容 string 和 number 类型的 ID 比较
        const itemSellerId = item.sellerId?.toString();
        const currentUserId = currentUser.id.toString();
        if (itemSellerId !== currentUserId) {
            alert(t('no_permission'));
            return;
        }
        
        try {
            console.log('Updating item:', { title, description, price: parseFloat(price), imageUrl });
            
            const res = await fetch(`/api/items/${item.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    title, 
                    description, 
                    price: parseFloat(price), 
                    imageUrl 
                }),
            });
            
            console.log('Response status:', res.status, res.statusText);
            
            if (res.ok) {
                const result = await res.json();
                console.log('Success:', result);
                router.push(`/${resolvedParams?.locale}/users/my-items`);
            } else {
                let errorData;
                try {
                    errorData = await res.json();
                    console.error('Update error:', errorData);
                } catch (jsonError) {
                    console.error('Failed to parse error response as JSON:', jsonError);
                    const textError = await res.text();
                    console.error('Error response text:', textError);
                    errorData = { error: `HTTP ${res.status}: ${textError || 'Unknown error'}` };
                }
                alert(`${t('update_fail')}: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Network error:', error);
            alert(`${t('update_fail')}: Network error - ${error}`);
        }
    }

    if (isLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">{t('loading')}</p>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return null; // 重定向会在 useEffect 中处理
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md mx-auto text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <h3 className="text-lg font-medium text-red-800 mb-2">{t('error')}</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <Link
                            href={`/${resolvedParams?.locale}/users/my-items`}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            {t('back_to_items')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 pb-24">
            <div className="max-w-2xl mx-auto px-4">
                {/* 返回链接 */}
                <Link
                    href={`/${resolvedParams?.locale}/users/my-items`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m0 7h18" />
                    </svg>
                    {t('back_to_items')}
                </Link>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold mb-6">{t('page_title')}</h1>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('title')} *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('description')}
                            </label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={4}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('price')} *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('image')}
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {uploading && (
                                <div className="text-blue-500 text-sm mt-2 flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                                    {t('uploading')}
                                </div>
                            )}
                            {imageUrl && (
                                <div className="mt-4">
                                    <img 
                                        src={imageUrl} 
                                        alt={t('preview_alt')} 
                                        className="w-full max-w-md h-48 object-cover rounded-lg border"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex space-x-4 pt-4">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                                disabled={uploading}
                            >
                                {t('save_changes')}
                            </button>
                            <Link
                                href={`/${resolvedParams?.locale}/users/my-items`}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-center"
                            >
                                {t('cancel')}
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
