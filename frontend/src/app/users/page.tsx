'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/lib/UserContext';
import { usersApi } from '@/lib/api';
import type { UserResponse } from '@/types';
import Link from 'next/link';

const ROLES = ['USER', 'PRO', 'OFFICER', 'CONTROLLER', 'HEAD', 'ADMIN', 'FINANCE'];

export default function UsersPage() {
  const { user, setUser, users, refreshUsers } = useUser();
  const [name, setName] = useState('');
  const [role, setRole] = useState('USER');
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      await usersApi.create({ name: name.trim(), role });
      setName('');
      await refreshUsers();
    } catch (err) {
      console.error('Failed to create user:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Select a User</h2>
            </div>
            <div className="p-6">
              {users.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No users yet. Create one to get started.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => setUser(u)}
                      className={`text-left p-4 rounded-lg border-2 transition-all ${
                        user?.id === u.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                          {u.name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <div className="font-medium">{u.name}</div>
                          <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                            {u.role}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Create User</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={creating || !name.trim()}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {creating ? 'Creating...' : 'Create User'}
              </button>
            </form>
          </div>

          {user && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">
                  Selected: {user.name} ({user.role})
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
