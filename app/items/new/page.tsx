"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { useTranslations } from 'next-intl';

//const { url } = await put('articles/blob.txt', 'Hello World!', { access: 'public' });
import { useRouter } from "next/navigation";

export default function ItemDetailPage({ params }: any) {
    const t = useTranslations('ItemNew');
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

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
        if (!title || !price || !imageUrl) {
            alert(t('form_incomplete'));
            return;
        }
        
        try {
            console.log('Submitting item:', { title, description, price: parseFloat(price), imageUrl });
            
            // 提交到后端 API
            const res = await fetch("/api/items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description, price: parseFloat(price), imageUrl }),
            });
            
            console.log('Response status:', res.status, res.statusText);
            
            if (res.ok) {
                const result = await res.json();
                console.log('Success:', result);
                router.push("/");
            } else {
                let errorData;
                try {
                    errorData = await res.json();
                    console.error('Submit error:', errorData);
                } catch (jsonError) {
                    console.error('Failed to parse error response as JSON:', jsonError);
                    const textError = await res.text();
                    console.error('Error response text:', textError);
                    errorData = { error: `HTTP ${res.status}: ${textError || 'Unknown error'}` };
                }
                alert(`${t('submit_fail')}: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Network error:', error);
            alert(`${t('submit_fail')}: Network error - ${error}`);
        }
    }

    return (
        <div className="max-w-lg mx-auto mt-12 p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-6">{t('page_title')}</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder={t('title')}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="border rounded px-3 py-2"
                    required
                />
                <textarea
                    placeholder={t('description')}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="border rounded px-3 py-2"
                    rows={3}
                />
                <input
                    type="number"
                    placeholder={t('price')}
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="border rounded px-3 py-2"
                    required
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="border rounded px-3 py-2"
                />
                {uploading && <div className="text-blue-500">{t('uploading')}</div>}
                {imageUrl && (
                    <img src={imageUrl} alt={t('preview_alt')} className="w-full h-40 object-cover rounded" />
                )}
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    disabled={uploading}
                >
                    {t('submit')}
                </button>
            </form>
        </div>
    );
}
