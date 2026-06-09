'use client';

import React, { useEffect, useState, use } from 'react';
import { nocApi } from '@/lib/api';
import { ModuleDetail } from '@/components/ModuleDetail';
import type { NOCRead, WorkflowHistoryEntry, ApplicationStatusResponse, ActionType } from '@/types';

export default function NOCDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [item, setItem] = useState<NOCRead | null>(null);
  const [history, setHistory] = useState<WorkflowHistoryEntry[]>([]);
  const [status, setStatus] = useState<ApplicationStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [itemData, historyData, statusData] = await Promise.all([
        nocApi.get(id),
        nocApi.getHistory(id),
        nocApi.getStatus(id),
      ]);
      setItem(itemData);
      setHistory(historyData);
      setStatus(statusData);
    } catch (err) {
      console.error('Failed to load NOC:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleAction = async (action: ActionType, comment?: string) => {
    const { user } = await import('@/lib/UserContext').then((m) => ({ user: null }));
    // We'll get user from the actual action handler below
  };

  const onAction = async (action: ActionType, comment?: string) => {
    const userJson = localStorage.getItem('selectedUser');
    if (!userJson) throw new Error('No user selected');
    const user = JSON.parse(userJson);
    await nocApi.action(id, action, { comment: comment || null }, user.id);
    await loadData();
  };

  const fields = item
    ? [
        { label: 'Applicant Name', value: item.applicant_name },
        { label: 'Applicant Email', value: item.applicant_email },
        { label: 'Purpose', value: item.purpose },
        { label: 'Property Address', value: item.property_address },
        { label: 'Valid From', value: item.valid_from },
        { label: 'Valid To', value: item.valid_to },
      ]
    : [];

  return (
    <ModuleDetail
      module="NOC"
      item={item || ({} as NOCRead)}
      fields={fields}
      onAction={onAction}
      history={history}
      status={status}
      loading={loading}
    />
  );
}
