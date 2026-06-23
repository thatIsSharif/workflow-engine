"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ApplicationForm from "@/components/ApplicationForm";
import { useUser } from "@/store/user-context";
import { MODULE_LABELS, MODULE_ICONS } from "@/lib/types";
import type { ModuleType } from "@/lib/types";

const modules: ModuleType[] = ["NOC", "LOA", "FINANCE", "RENTAL", "CANCELLATION"];

function CreateForm() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselected = searchParams.get("module");

  const [selectedModule, setSelectedModule] = useState<ModuleType | null>(
    preselected
      ? (preselected.toUpperCase() as ModuleType)
      : null
  );

  useEffect(() => {
    if (isLoading) return;
    if (!user) router.push("/");
  }, [user, isLoading, router]);

  // Validate preselected module
  useEffect(() => {
    if (preselected) {
      const upper = preselected.toUpperCase() as ModuleType;
      if (modules.includes(upper)) {
        setSelectedModule(upper);
      }
    }
  }, [preselected]);

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
        <div className="flex items-center gap-3 mb-8">
          <Link href="/applications" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">New Application</h1>
        </div>

        {!selectedModule ? (
          <div>
            <p className="text-gray-500 mb-6">Select the type of application you want to create:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedModule(m)}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{MODULE_ICONS[m]}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {MODULE_LABELS[m]}
                      </h3>
                      <p className="text-sm text-gray-500">Create application</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setSelectedModule(null)}
              className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to module selection
            </button>
            <ApplicationForm module={selectedModule} />
          </div>
        )}
      </main>
    </>
  );
}

export default function CreateApplicationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    }>
      <CreateForm />
    </Suspense>
  );
}
