'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { rentalApi } from '@/lib/api';
import { StatusBadge } from '@/components/WorkflowStatus';
import type { RentalRead } from '@/types';

export default function RentalListPage() {
  const [items, setItems] = useState<RentalRead[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { rentalApi.list().then(setItems).catch(console.error).finally(() => setLoading(false)); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rental Applications</h1>
        <Link href="/rental/new" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">+ New Rental</Link>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? <div className="p-12 text-center text-gray-500">Loading...</div>
        : items.length === 0 ? <div className="p-12 text-center text-gray-500">No rental applications yet. <Link href="/rental/new" className="text-indigo-600 hover:underline">Create one</Link></div>
        : <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tenant</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Property</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Rent</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/rental/${item.id}`}>
                  <td className="px-6 py-4 text-sm font-medium">{item.tenant_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{item.property_address}</td>
                  <td className="px-6 py-4 text-sm text-right">${Number(item.rental_amount).toLocaleString()}/mo</td>
                  <td className="px-6 py-4"><StatusBadge status={item.status} size="sm" /></td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-right">{new Date(item.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>
    </div>
  );
}
