"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useUser } from "@/store/user-context";
import { MODULE_LABELS, MODULE_ICONS } from "@/lib/types";
import type { ModuleType } from "@/lib/types";

const modules: ModuleType[] = ["NOC", "LOA", "FINANCE", "RENTAL", "CANCELLATION"];

export default function ApplicationsPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) router.push("/");
  }, [user, isLoading, router]);

  if (isLoading || !user) {
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
            <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
            <p className="text-gray-500 mt-1">Select a module to view applications</p>
          </div>
          <Link
            href="/applications/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            + New Application
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((m) => (
            <Link
              key={m}
              href={`/applications/${m.toLowerCase()}`}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-blue-300 group"
            >
              <div className="flex items-center gap-4 mb-3">
                <span className="text-3xl">{MODULE_ICONS[m]}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {MODULE_LABELS[m]}
                  </h3>
                  <p className="text-sm text-gray-500">
                    View and manage {MODULE_LABELS[m].toLowerCase()} applications
                  </p>
                </div>
              </div>
              <div className="flex items-center text-sm text-blue-600 group-hover:text-blue-700 font-medium">
                Browse applications →
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
