'use client';

import { useState, useEffect } from 'react';

interface DetailApi<T, H, S> {
  get: (id: string) => Promise<T>;
  getHistory: (id: string) => Promise<H[]>;
  getStatus: (id: string) => Promise<S>;
}

export function useModuleDetail<T, H, S>(id: string, api: DetailApi<T, H, S>) {
  const [item, setItem] = useState<T | null>(null);
  const [history, setHistory] = useState<H[]>([]);
  const [status, setStatus] = useState<S | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [itemData, historyData, statusData] = await Promise.all([
        api.get(id),
        api.getHistory(id),
        api.getStatus(id),
      ]);
      setItem(itemData);
      setHistory(historyData);
      setStatus(statusData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  return { item, history, status, loading, reload: loadData };
}
