'use client';
import React, { useEffect, useState, use } from 'react';
import { financeApi } from '@/lib/api';
import { ModuleDetail } from '@/components/ModuleDetail';
import type { FinanceRead, WorkflowHistoryEntry, ApplicationStatusResponse, ActionType } from '@/types';

export default function FinanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [item, setItem] = useState<FinanceRead | null>(null);
  const [history, setHistory] = useState<WorkflowHistoryEntry[]>([]);
  const [status, setStatus] = useState<ApplicationStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [d, h, s] = await Promise.all([financeApi.get(id), financeApi.getHistory(id), financeApi.getStatus(id)]);
      setItem(d); setHistory(h); setStatus(s);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, [id]);

  const onAction = async (action: ActionType, comment?: string) => {
    const user = JSON.parse(localStorage.getItem('selectedUser')!);
    await financeApi.action(id, action, { comment: comment || null }, user.id);
    await loadData();
  };

  const fields = item ? [
    { label: 'Applicant', value: item.applicant_name },
    { label: 'Department', value: item.department },
    { label: 'Amount', value: `$${Number(item.amount).toLocaleString()}` },
    { label: 'Purpose', value: item.purpose },
    { label: 'Supporting Document', value: item.supporting_document_ref || 'N/A' },
  ] : [];

  return <ModuleDetail module="FINANCE" item={item || ({} as FinanceRead)} fields={fields} onAction={onAction} history={history} status={status} loading={loading} />;
}
