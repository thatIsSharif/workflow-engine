'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/UserContext';
import { MODULE_LABELS, type ModuleType } from '@/types';

export interface FieldDef {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'date' | 'number' | 'textarea';
  required?: boolean;
  placeholder?: string;
  min?: number;
  step?: number;
}

interface ModuleFormProps {
  module: ModuleType;
  fields: FieldDef[];
  onSubmit: (data: Record<string, any>, userId: number) => Promise<any>;
  initialData?: Record<string, any>;
}

export function ModuleForm({ module, fields, onSubmit, initialData }: ModuleFormProps) {
  const router = useRouter();
  const { user } = useUser();
  const [formData, setFormData] = useState<Record<string, any>>(initialData || {});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please select a user first');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const result = await onSubmit(formData, user.id);
      router.push(`/${module.toLowerCase()}/${result.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">New {MODULE_LABELS[module]}</h2>
        </div>
        <div className="p-6 space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  min={field.min}
                  step={field.step}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !user}
          className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Creating...' : `Create ${module}`}
        </button>
      </div>
    </form>
  );
}
