'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { rentalApi } from '@/lib/api';
import { StatusBadge } from '@/components/WorkflowStatus';
import type { RentalRead } from '@/types';
import { MODULE_ICONS } from '@/types';

export default function RentalListPage() {
  const router = useRouter();
  const [items, setItems] = useState<RentalRead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rentalApi.list().then(setItems).catch(console.error).finally(() => setLoading(false));
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
        <h1 className="text-2xl font-bold text-gray-900">Rental Applications</h1>
        <Link href="/rental/new" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">+ New Rental</Link>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">{MODULE_ICONS.RENTAL}</p>
            <p className="text-gray-500">No rental applications yet.</p>
            <Link href="/rental/new" className="inline-block mt-2 text-indigo-600 hover:underline">Create one</Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tenant</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Property</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rent</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => router.push(`/rental/${item.id}`)}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.tenant_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{item.property_address}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">${Number(item.rental_amount).toLocaleString()}/mo</td>
                  <td className="px-6 py-4"><StatusBadge status={item.status} size="sm" /></td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-right">{new Date(item.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
