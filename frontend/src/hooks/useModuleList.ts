'use client';

import { useState, useEffect } from 'react';

interface ListApi<T> {
  list: () => Promise<T[]>;
}

export function useModuleList<T>(api: ListApi<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .list()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [api]);

  return { items, loading };
}
