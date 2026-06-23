"use client";

import Link from "next/link";
import { useUser } from "@/store/user-context";

export default function Navbar() {
  const { user, setUser } = useUser();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              Workflow Engine
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-50"
              >
                Dashboard
              </Link>
              <Link
                href="/applications"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-50"
              >
                Applications
              </Link>
              <Link
                href="/applications/create"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-50"
              >
                New Application
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <span className="text-sm text-gray-500">
                  {user.name}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {user.role}
                </span>
                <button
                  onClick={() => setUser(null)}
                  className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
                >
                  Change User
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
