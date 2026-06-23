"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import { useUser } from "@/store/user-context";
import { listByModule } from "@/lib/api";
import { MODULE_LABELS, MODULE_ICONS, WORKFLOW_CONFIG, isTerminalState } from "@/lib/types";
import type { ModuleType, DomainReadBase } from "@/lib/types";

interface ModuleSummary {
  module: ModuleType;
  total: number;
  pending: number;
  completed: number;
  rejected: number;
}

interface RecentItem {
  module: ModuleType;
  id: string;
  status: string;
  updated_at: string;
  title: string;
}

export default function DashboardPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [summaries, setSummaries] = useState<ModuleSummary[]>([]);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/");
      return;
    }

    const modules: ModuleType[] = ["NOC", "LOA", "FINANCE", "RENTAL", "CANCELLATION"];

    Promise.all(
      modules.map(async (m) => {
        try {
          const items = (await listByModule(m)) as DomainReadBase[];
          return { module: m, items };
        } catch {
          return { module: m, items: [] as DomainReadBase[] };
        }
      })
    ).then((results) => {
      const sum: ModuleSummary[] = results.map(({ module, items }) => {
        const config = WORKFLOW_CONFIG[module];
        const terminalStates = (config?.states || []).filter((s) => isTerminalState(module, s));
        return {
          module,
          total: items.length,
          pending: items.filter((i) => !terminalStates.includes(i.status)).length,
          completed: items.filter((i) => i.status === "APPROVED" || i.status === "COMPLETED" || i.status === "SIGNED").length,
          rejected: items.filter((i) => i.status === "REJECTED").length,
        };
      });
      setSummaries(sum);

      const allItems: RecentItem[] = results.flatMap(({ module, items }) =>
        items.slice(0, 5).map((i: DomainReadBase) => {
          const titleField = getTitleField(module, i as unknown as Record<string, unknown>);
          return {
            module,
            id: i.id,
            status: i.status,
            updated_at: i.updated_at,
            title: titleField,
          };
        })
      );
      allItems.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      setRecentItems(allItems.slice(0, 8));
      setPageLoading(false);
    });
  }, [user, isLoading, router]);

  function getTitleField(module: ModuleType, item: Record<string, unknown>): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    switch (module) {
      case "NOC": return (item.applicant_name as string) || "N/A";
      case "LOA": return (item.applicant_name as string) || "N/A";
      case "FINANCE": return `${(item.applicant_name as string) || "N/A"} - ${(item.department as string) || ""}`;
      case "RENTAL": return (item.tenant_name as string) || "N/A";
      case "CANCELLATION": return (item.applicant_name as string) || "N/A";
    }
  }

  if (isLoading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Welcome, {user?.name} ({user?.role})
            </p>
          </div>
          <Link
            href="/applications/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            + New Application
          </Link>
        </div>

        {/* Module summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          {summaries.map((s) => (
            <Link
              key={s.module}
              href={`/applications/${s.module.toLowerCase()}`}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{MODULE_ICONS[s.module]}</span>
                <h3 className="font-semibold text-gray-900">{MODULE_LABELS[s.module]}</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Total</span>
                  <p className="font-semibold text-gray-900">{s.total}</p>
                </div>
                <div>
                  <span className="text-gray-500">Active</span>
                  <p className="font-semibold text-amber-600">{s.pending}</p>
                </div>
                <div>
                  <span className="text-gray-500">Completed</span>
                  <p className="font-semibold text-green-600">{s.completed}</p>
                </div>
                <div>
                  <span className="text-gray-500">Rejected</span>
                  <p className="font-semibold text-red-600">{s.rejected}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Applications</h2>
          {recentItems.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {recentItems.map((item) => (
                <Link
                  key={`${item.module}-${item.id}`}
                  href={`/applications/${item.module.toLowerCase()}/${item.id}`}
                  className="flex items-center justify-between py-3 hover:bg-gray-50 px-2 -mx-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{MODULE_ICONS[item.module]}</span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500">{MODULE_LABELS[item.module]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={item.status} size="sm" />
                    <span className="text-xs text-gray-400">
                      {new Date(item.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No applications yet.</p>
              <Link
                href="/applications/create"
                className="text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
              >
                Create your first application
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
