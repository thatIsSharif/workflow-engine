'use client';

import React, { useEffect, useState, use } from 'react';
import { loaApi } from '@/lib/api';
import { ModuleDetail } from '@/components/ModuleDetail';
import type { LOARead, WorkflowHistoryEntry, ApplicationStatusResponse, ActionType } from '@/types';

export default function LOADetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [item, setItem] = useState<LOARead | null>(null);
  const [history, setHistory] = useState<WorkflowHistoryEntry[]>([]);
  const [status, setStatus] = useState<ApplicationStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [itemData, historyData, statusData] = await Promise.all([
        loaApi.get(id),
        loaApi.getHistory(id),
        loaApi.getStatus(id),
      ]);
      setItem(itemData);
      setHistory(historyData);
      setStatus(statusData);
    } catch (err) {
      console.error('Failed to load LOA:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const onAction = async (action: ActionType, comment?: string) => {
    const userJson = localStorage.getItem('selectedUser');
    if (!userJson) throw new Error('No user selected');
    const user = JSON.parse(userJson);
    await loaApi.action(id, action, { comment: comment || null }, user.id);
    await loadData();
  };

  const fields = item
    ? [
        { label: 'Applicant Name', value: item.applicant_name },
        { label: 'Applicant Email', value: item.applicant_email },
        { label: 'Authorized Person', value: item.authorized_person_name },
        { label: 'Authorized Person ID', value: item.authorized_person_id },
        { label: 'Scope of Authorization', value: item.scope_of_authorization },
        { label: 'Valid From', value: item.valid_from },
        { label: 'Valid To', value: item.valid_to },
      ]
    : [];

  return (
    <ModuleDetail
      module="LOA"
      item={item || ({} as LOARead)}
      fields={fields}
      onAction={onAction}
      history={history}
      status={status}
      loading={loading}
    />
  );
}
