"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

//const { url } = await put('articles/blob.txt', 'Hello World!', { access: 'public' });
import { useRouter } from "next/navigation";

export default function NewItemPage() {
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
            const { url } = await upload(file, { client: true });
            setImageUrl(url);
        } catch (err) {
            alert("图片上传失败");
        }
        setUploading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title || !price || !imageUrl) {
            alert("请填写完整信息并上传图片");
            return;
        }
        // 提交到后端 API
        const res = await fetch("/api/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description, price: parseFloat(price), imageUrl }),
        });
        if (res.ok) {
            router.push("/");
        } else {
            alert("发布失败");
        }
    }

    return (
        <div className="max-w-lg mx-auto mt-12 p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-6">发布二手物品</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="标题"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="border rounded px-3 py-2"
                    required
                />
                <textarea
                    placeholder="描述"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="border rounded px-3 py-2"
                    rows={3}
                />
                <input
                    type="number"
                    placeholder="价格"
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
                {uploading && <div className="text-blue-500">图片上传中...</div>}
                {imageUrl && (
                    <img src={imageUrl} alt="预览" className="w-full h-40 object-cover rounded" />
                )}
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    disabled={uploading}
                >
                    发布
                </button>
            </form>
        </div>
    );
}
