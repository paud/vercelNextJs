"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';

interface FormData {
  title: string;
  description: string;
  price: string;
  imageUrl: string;
}

export default function NewItem({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<string>('en');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    imageUrl: ''
  });
  const router = useRouter();

  useEffect(() => {
    async function initialize() {
      const resolvedParams = await params;
      setLocale(resolvedParams.locale);

      // Check authentication
      try {
        const response = await fetch('/api/auth/check');
        if (response.ok) {
          const user = await response.json();
          setCurrentUser(user);
        } else {
          // Redirect to login if not authenticated
          router.push(`/${resolvedParams.locale}/users/login`);
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push(`/${resolvedParams.locale}/users/login`);
        return;
      }

      setLoading(false);
    }

    initialize();
  }, [params, router]);

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
        alert(`Failed to create item: ${error.message || error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Error creating item. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-12">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Create New Item</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-lg font-medium mb-2 text-gray-700">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="Enter item title"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-lg font-medium mb-2 text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            placeholder="Describe your item"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>
        
        <div>
          <label htmlFor="price" className="block text-lg font-medium mb-2 text-gray-700">
            Price *
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-lg font-medium mb-2 text-gray-700">
            Item Image
          </label>
          <ImageUpload
            onImageUploaded={handleImageUploaded}
            className="w-full"
          />
          {formData.imageUrl && (
            <p className="mt-2 text-sm text-green-600">
              ✅ Image uploaded successfully
            </p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Creating Item...' : 'Create Item'}
        </button>
      </form>
    </div>
  );
}
