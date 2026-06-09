'use client';
import React, { useEffect, useState, use } from 'react';
import { rentalApi } from '@/lib/api';
import { ModuleDetail } from '@/components/ModuleDetail';
import type { RentalRead, WorkflowHistoryEntry, ApplicationStatusResponse, ActionType } from '@/types';

export default function RentalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [item, setItem] = useState<RentalRead | null>(null);
  const [history, setHistory] = useState<WorkflowHistoryEntry[]>([]);
  const [status, setStatus] = useState<ApplicationStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [d, h, s] = await Promise.all([rentalApi.get(id), rentalApi.getHistory(id), rentalApi.getStatus(id)]);
      setItem(d); setHistory(h); setStatus(s);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, [id]);

  const onAction = async (action: ActionType, comment?: string) => {
    const user = JSON.parse(localStorage.getItem('selectedUser')!);
    await rentalApi.action(id, action, { comment: comment || null }, user.id);
    await loadData();
  };

  const fields = item ? [
    { label: 'Tenant Name', value: item.tenant_name },
    { label: 'Tenant Email', value: item.tenant_email },
    { label: 'Property Address', value: item.property_address },
    { label: 'Rental Amount', value: `$${Number(item.rental_amount).toLocaleString()}/mo` },
    { label: 'Lease Start', value: item.lease_start },
    { label: 'Lease End', value: item.lease_end },
  ] : [];

  return <ModuleDetail module="RENTAL" item={item || ({} as RentalRead)} fields={fields} onAction={onAction} history={history} status={status} loading={loading} />;
}
