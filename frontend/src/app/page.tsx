'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/UserContext';
import { nocApi, loaApi, financeApi, rentalApi, cancellationApi } from '@/lib/api';
import { MODULE_LABELS, MODULE_ICONS, MODULE_COLORS, type ModuleType, type DomainReadBase } from '@/types';

interface ModuleSummary {
  module: ModuleType;
  total: number;
  items: DomainReadBase[];
  color: string;
}

const apis = {
  NOC: nocApi,
  LOA: loaApi,
  FINANCE: financeApi,
  RENTAL: rentalApi,
  CANCELLATION: cancellationApi,
};

export default function Dashboard() {
  const { user } = useUser();
  const router = useRouter();
  const [summaries, setSummaries] = useState<ModuleSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      try {
        const results = await Promise.allSettled([
          apis.NOC.list(),
          apis.LOA.list(),
          apis.FINANCE.list(),
          apis.RENTAL.list(),
          apis.CANCELLATION.list(),
        ]);

        const modules: ModuleType[] = ['NOC', 'LOA', 'FINANCE', 'RENTAL', 'CANCELLATION'];
        const newSummaries: ModuleSummary[] = modules.map((mod, i) => {
          const res = results[i];
          const items = res.status === 'fulfilled' ? res.value : [];
          return {
            module: mod,
            total: items.length,
            items: items as DomainReadBase[],
            color: MODULE_COLORS[mod],
          };
        });
        setSummaries(newSummaries);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  const allItems = summaries.flatMap((s) =>
    s.items.map((item) => ({ ...item, module: s.module }))
  );

  const recentItems = allItems
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          {user ? (
            <>Welcome back, <span className="font-semibold">{user.name}</span> ({user.role})</>
          ) : (
            <>Please <Link href="/users" className="text-indigo-600 hover:underline">select a user</Link> to get started</>
          )}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-20 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-12" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
            {summaries.map((s) => (
              <Link
                key={s.module}
                href={`/${s.module.toLowerCase()}`}
                className={`rounded-xl shadow-sm border p-6 transition-all hover:shadow-md hover:-translate-y-0.5 ${s.color}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{MODULE_ICONS[s.module]}</span>
                  <span className="text-xs font-medium opacity-60">{s.module}</span>
                </div>
                <div className="text-3xl font-bold">{s.total}</div>
                <div className="text-sm mt-1 opacity-75">{MODULE_LABELS[s.module]}</div>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recent Applications</h2>
                {recentItems.length > 0 && (
                  <span className="text-xs text-gray-400">Latest 10</span>
                )}
              </div>
              <div className="p-6">
                {recentItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-4xl mb-3">📋</p>
                    <p className="text-gray-500">
                      No applications yet. Create one from the sidebar.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentItems.map((item: any) => (
                      <div
                        key={`${item.module}-${item.id}`}
                        onClick={() => router.push(`/${item.module.toLowerCase()}/${item.id}`)}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex-shrink-0 text-xl">{MODULE_ICONS[item.module as ModuleType]}</span>
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">
                              {item.applicant_name || item.tenant_name || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">{MODULE_LABELS[item.module as ModuleType]}</div>
                          </div>
                        </div>
                        <span className={`flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'APPROVED' || item.status === 'COMPLETED' || item.status === 'SIGNED'
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                {(['NOC', 'LOA', 'FINANCE', 'RENTAL', 'CANCELLATION'] as ModuleType[]).map((mod) => (
                  <Link
                    key={mod}
                    href={`/${mod.toLowerCase()}/new`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-sm transition-all"
                  >
                    <span className="text-xl flex-shrink-0">{MODULE_ICONS[mod]}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium">New {MODULE_LABELS[mod]}</div>
                      <div className="text-xs text-gray-500">Create a new {mod.toLowerCase()} application</div>
                    </div>
                    <svg className="w-5 h-5 ml-auto text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
