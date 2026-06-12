'use client';
import React from 'react';
import Link from 'next/link';
import { financeApi } from '@/lib/api';
import { StatusBadge } from '@/components/WorkflowStatus';
import { useModuleList } from '@/hooks/useModuleList';
import { PAGE_TITLES, NEW_BUTTON_LABELS, EMPTY_MESSAGES } from '@/constants';
import type { FinanceRead } from '@/types';

export default function FinanceListPage() {
  const { items, loading } = useModuleList<FinanceRead>(financeApi);
  const mod = 'FINANCE';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{PAGE_TITLES[mod]}</h1>
        <Link href="/finance/new" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">{NEW_BUTTON_LABELS[mod]}</Link>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-gray-500">{EMPTY_MESSAGES[mod].title} <Link href="/finance/new" className="text-indigo-600 hover:underline">{EMPTY_MESSAGES[mod].linkText}</Link></div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Applicant</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Department</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/finance/${item.id}`}>
                  <td className="px-6 py-4 text-sm font-medium">{item.applicant_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.department}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">${Number(item.amount).toLocaleString()}</td>
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
