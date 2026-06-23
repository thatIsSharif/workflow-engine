"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchUsers, createUser } from "@/lib/api";
import { useUser } from "@/store/user-context";
import type { User } from "@/lib/types";

export default function HomePage() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("USER");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
      return;
    }

    fetchUsers()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, router]);

  const handleCreateUser = async () => {
    if (!newName.trim()) return;
    setError("");
    try {
      const newUser = await createUser({ name: newName, role: newRole });
      setUsers((prev) => [...prev, newUser]);
      setShowCreate(false);
      setNewName("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create user");
    }
  };

  const handleSelectUser = (u: User) => {
    setUser(u);
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Workflow Engine</h1>
          <p className="mt-2 text-gray-500">Select a user to continue</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {users.length > 0 ? (
            <div className="space-y-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                >
                  <span className="font-medium text-gray-900">{u.name}</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {u.role}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              No users found. Create one to get started.
            </p>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100">
            {showCreate ? (
              <div className="space-y-3">
                {error && (
                  <div className="text-sm text-red-600">{error}</div>
                )}
                <input
                  type="text"
                  placeholder="User name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USER">User</option>
                  <option value="PRO">PRO</option>
                  <option value="OFFICER">Officer</option>
                  <option value="CONTROLLER">Controller</option>
                  <option value="HEAD">Head</option>
                  <option value="ADMIN">Admin</option>
                  <option value="FINANCE">Finance</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateUser}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCreate(true)}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                + Create New User
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
