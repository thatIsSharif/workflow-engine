'use client';
import React, { useEffect, useState, use } from 'react';
import { cancellationApi } from '@/lib/api';
import { ModuleDetail } from '@/components/ModuleDetail';
import type { CancellationRead, WorkflowHistoryEntry, ApplicationStatusResponse, ActionType } from '@/types';

export default function CancellationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [item, setItem] = useState<CancellationRead | null>(null);
  const [history, setHistory] = useState<WorkflowHistoryEntry[]>([]);
  const [status, setStatus] = useState<ApplicationStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [d, h, s] = await Promise.all([cancellationApi.get(id), cancellationApi.getHistory(id), cancellationApi.getStatus(id)]);
      setItem(d); setHistory(h); setStatus(s);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, [id]);

  const onAction = async (action: ActionType, comment?: string) => {
    const user = JSON.parse(localStorage.getItem('selectedUser')!);
    await cancellationApi.action(id, action, { comment: comment || null }, user.id);
    await loadData();
  };

  const fields = item ? [
    { label: 'Applicant Name', value: item.applicant_name },
    { label: 'Reference Application', value: `${item.reference_application_type}: ${item.reference_application_id}` },
    { label: 'Reason', value: item.reason },
  ] : [];

  return <ModuleDetail module="CANCELLATION" item={item || ({} as CancellationRead)} fields={fields} onAction={onAction} history={history} status={status} loading={loading} />;
}
