'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { loaApi } from '@/lib/api';
import { StatusBadge } from '@/components/WorkflowStatus';
import type { LOARead } from '@/types';

export default function LOAListPage() {
  const [items, setItems] = useState<LOARead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loaApi
      .list()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Letters of Authorization</h1>
        <Link
          href="/loa/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + New LOA
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No LOA applications yet.
            <Link href="/loa/new" className="block mt-2 text-indigo-600 hover:underline">
              Create your first LOA
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Applicant</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Authorized Person</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => (window.location.href = `/loa/${item.id}`)}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.applicant_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.authorized_person_name}</td>
                  <td className="px-6 py-4"><StatusBadge status={item.status} size="sm" /></td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-right">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
