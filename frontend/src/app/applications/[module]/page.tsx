"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import { useUser } from "@/store/user-context";
import { listByModule } from "@/lib/api";
import { MODULE_LABELS, MODULE_ICONS, isTerminalState, WORKFLOW_CONFIG } from "@/lib/types";
import type { ModuleType, DomainReadBase } from "@/lib/types";

const moduleMap: Record<string, ModuleType> = {
  noc: "NOC",
  loa: "LOA",
  finance: "FINANCE",
  rental: "RENTAL",
  cancellation: "CANCELLATION",
};

export default function ModuleListPage() {
  const params = useParams();
  const moduleSlug = params.module as string;
  const moduleType = moduleMap[moduleSlug];

  const { user, isLoading } = useUser();
  const router = useRouter();
  const [items, setItems] = useState<DomainReadBase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.push("/"); return; }
    if (!moduleType) { router.push("/applications"); return; }

    listByModule(moduleType)
      .then((data) => setItems(data as DomainReadBase[]))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [user, isLoading, moduleType, router]);

  function getTitle(item: DomainReadBase): string {
    const r = item as unknown as Record<string, unknown>;
    switch (moduleType) {
      case "NOC": return (r.applicant_name as string) || "N/A";
      case "LOA": return (r.applicant_name as string) || "N/A";
      case "FINANCE": return `${r.applicant_name || "N/A"} (${r.department || ""})`;
      case "RENTAL": return (r.tenant_name as string) || "N/A";
      case "CANCELLATION": return (r.applicant_name as string) || "N/A";
      default: return "N/A";
    }
  }

  if (isLoading || !user || !moduleType) {
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
          <div className="flex items-center gap-3">
            <Link href="/applications" className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <span className="text-2xl">{MODULE_ICONS[moduleType]}</span>
            <h1 className="text-2xl font-bold text-gray-900">{MODULE_LABELS[moduleType]} Applications</h1>
          </div>
          <Link
            href={`/applications/create?module=${moduleSlug}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            + New {MODULE_LABELS[moduleType]}
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4">No {MODULE_LABELS[moduleType].toLowerCase()} applications found.</p>
            <Link
              href={`/applications/create?module=${moduleSlug}`}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first {MODULE_LABELS[moduleType].toLowerCase()} application
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getTitle(item)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link
                        href={`/applications/${moduleSlug}/${item.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
