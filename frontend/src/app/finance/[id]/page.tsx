'use client';
import React, { use } from 'react';
import { financeApi } from '@/lib/api';
import { ModuleDetail } from '@/components/ModuleDetail';
import { useUser } from '@/lib/UserContext';
import { useModuleDetail } from '@/hooks/useModuleDetail';
import { getDetailFields } from '@/constants';
import type { FinanceRead, WorkflowHistoryEntry, ApplicationStatusResponse, ActionType } from '@/types';

export default function FinanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useUser();
  const { item, history, status, loading, reload } = useModuleDetail<FinanceRead, WorkflowHistoryEntry, ApplicationStatusResponse>(id, financeApi);

  const onAction = async (action: ActionType, comment?: string) => {
    if (!user) throw new Error('No user selected');
    await financeApi.action(id, action, { comment: comment || null }, user.id);
    await reload();
  };

  return <ModuleDetail module="FINANCE" item={item || ({} as FinanceRead)} fields={getDetailFields('FINANCE', item)} onAction={onAction} history={history} status={status} loading={loading} />;
}
