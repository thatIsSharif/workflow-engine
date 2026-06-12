'use client';
import React from 'react';
import Link from 'next/link';
import { nocApi } from '@/lib/api';
import { StatusBadge } from '@/components/WorkflowStatus';
import { useModuleList } from '@/hooks/useModuleList';
import { PAGE_TITLES, NEW_BUTTON_LABELS, EMPTY_MESSAGES } from '@/constants';
import type { NOCRead } from '@/types';

export default function NOCListPage() {
  const { items, loading } = useModuleList<NOCRead>(nocApi);
  const mod = 'NOC';

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
        <h1 className="text-2xl font-bold text-gray-900">{PAGE_TITLES[mod]}</h1>
        <Link
          href="/noc/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          {NEW_BUTTON_LABELS[mod]}
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {EMPTY_MESSAGES[mod].title}
            <Link href="/noc/new" className="block mt-2 text-indigo-600 hover:underline">
              {EMPTY_MESSAGES[mod].linkText}
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Applicant</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Property</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => (window.location.href = `/noc/${item.id}`)}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.applicant_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.applicant_email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{item.property_address}</td>
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
