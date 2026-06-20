'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserProvider, useUser } from '@/lib/UserContext';
import { MODULE_LABELS, MODULE_ICONS, type ModuleType } from '@/types';
import './globals.css';

const modules: ModuleType[] = ['NOC', 'LOA', 'FINANCE', 'RENTAL', 'CANCELLATION'];

function NavLink({ href, children, icon }: { href: string; children: React.ReactNode; icon?: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/' && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-indigo-50 text-indigo-700 shadow-sm'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </Link>
  );
}

function Header() {
  const { user, setUser, users } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleUserChange = (u: typeof user) => {
    setUser(u);
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 h-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">⚙️</span>
          <span className="text-xl font-bold text-gray-900">Workflow Engine</span>
        </Link>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            {user ? (
              <>
                <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <div className="text-left">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.role}</div>
                </div>
              </>
            ) : (
              <span className="text-sm text-gray-500">Select User</span>
            )}
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Select User
                  </div>
                  {users.length === 0 ? (
                    <Link
                      href="/users"
                      className="block px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Create a user first →
                    </Link>
                  ) : (
                    users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => handleUserChange(u)}
                        className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2 ${
                          user?.id === u.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-semibold">
                          {u.name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <div className="font-medium">{u.name}</div>
                          <div className="text-xs text-gray-500">{u.role}</div>
                        </div>
                        {user?.id === u.id && (
                          <svg className="w-4 h-4 ml-auto text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
          Overview
        </div>
        <NavLink href="/" icon="📊">Dashboard</NavLink>
        <NavLink href="/users" icon="👥">Users</NavLink>

        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2 mt-4">
          Applications
        </div>
        {modules.map((mod) => (
          <NavLink key={mod} href={`/${mod.toLowerCase()}`} icon={MODULE_ICONS[mod]}>
            {MODULE_LABELS[mod]}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <Header />
          <LayoutContent>{children}</LayoutContent>
        </UserProvider>
      </body>
    </html>
  );
}
