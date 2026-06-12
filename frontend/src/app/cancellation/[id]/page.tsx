'use client';
import React, { use } from 'react';
import { cancellationApi } from '@/lib/api';
import { ModuleDetail } from '@/components/ModuleDetail';
import { useUser } from '@/lib/UserContext';
import { useModuleDetail } from '@/hooks/useModuleDetail';
import { getDetailFields } from '@/constants';
import type { CancellationRead, WorkflowHistoryEntry, ApplicationStatusResponse, ActionType } from '@/types';

export default function CancellationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useUser();
  const { item, history, status, loading, reload } = useModuleDetail<CancellationRead, WorkflowHistoryEntry, ApplicationStatusResponse>(id, cancellationApi);

  const onAction = async (action: ActionType, comment?: string) => {
    if (!user) throw new Error('No user selected');
    await cancellationApi.action(id, action, { comment: comment || null }, user.id);
    await reload();
  };

  return <ModuleDetail module="CANCELLATION" item={item || ({} as CancellationRead)} fields={getDetailFields('CANCELLATION', item)} onAction={onAction} history={history} status={status} loading={loading} />;
}
