'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserResponse } from '@/types';
import { usersApi } from './api';

interface UserContextType {
  user: UserResponse | null;
  setUser: (user: UserResponse | null) => void;
  users: UserResponse[];
  loading: boolean;
  refreshUsers: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  users: [],
  loading: true,
  refreshUsers: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshUsers = async () => {
    try {
      const data = await usersApi.list();
      setUsers(data);
    } catch {
      // API might not be available
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('selectedUser');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('selectedUser');
      }
    }
    refreshUsers();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('selectedUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('selectedUser');
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, users, loading, refreshUsers }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
