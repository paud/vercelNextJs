"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import ImageUpload from '@/components/ImageUpload';
import UserHeader from '../../../../components/UserHeader';
import { useCurrentUser } from '../../../../hooks/useCurrentUser';

interface FormData {
  title: string;
  description: string;
  price: string;
  imageUrl: string;
}

export default function NewItem({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<string>('en');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    imageUrl: ''
  });
  const router = useRouter();
  const localeFromHook = useLocale();
  const t = useTranslations('ItemNew');
  const { user: currentUser } = useCurrentUser();

  useEffect(() => {
    async function initialize() {
      const resolvedParams = await params;
      setLocale(resolvedParams.locale);
    }

    initialize();
  }, [params]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUploaded = (url: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrl: url
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert(t('login_required'));
      return;
    }

    if (!formData.title.trim() || !formData.price.trim() || !formData.imageUrl) {
      alert(t('form_incomplete'));
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          imageUrl: formData.imageUrl,
          sellerId: currentUser.id
        }),
      });

      if (response.ok) {
        const item = await response.json();
        router.push(`/${locale}/items/${item.id}`);
      } else {
        const error = await response.json();
        console.error('Failed to create item:', error);
        alert(`${t('submit_fail')}: ${error.message || error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating item:', error);
      alert(t('submit_fail'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <UserHeader>
      <div className="min-h-screen bg-gray-50 pt-2 pb-16">
        <div className="max-w-sm w-full mx-auto p-3 sm:p-6 bg-white rounded-lg shadow-md mt-2 mb-8 flex flex-col justify-start">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 text-center">{t('page_title')}</h1>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label htmlFor="title" className="block text-base sm:text-lg font-medium mb-1 sm:mb-2 text-gray-700">
            {t('title')} *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder={t('title')}
            className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-base sm:text-lg font-medium mb-1 sm:mb-2 text-gray-700">
            {t('description')}
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            placeholder={t('description')}
            className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="price" className="block text-base sm:text-lg font-medium mb-1 sm:mb-2 text-gray-700">
            {t('price')} *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            required
            placeholder="0.00"
            className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-base sm:text-lg font-medium mb-1 sm:mb-2 text-gray-700">
            {t('item_image')}
          </label>
          <ImageUpload
            onImageUploaded={handleImageUploaded}
            className="w-full"
          />
          {formData.imageUrl && (
            <p className="mt-2 text-sm text-green-600">
              ✅ {t('upload_success')}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-500 text-white py-2.5 sm:py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? t('uploading') : t('submit')}
        </button>
      </form>
        </div>
      </div>
    </UserHeader>
  );
}
