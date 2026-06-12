'use client';
import React, { use } from 'react';
import { loaApi } from '@/lib/api';
import { ModuleDetail } from '@/components/ModuleDetail';
import { useUser } from '@/lib/UserContext';
import { useModuleDetail } from '@/hooks/useModuleDetail';
import { getDetailFields } from '@/constants';
import type { LOARead, WorkflowHistoryEntry, ApplicationStatusResponse, ActionType } from '@/types';

export default function LOADetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useUser();
  const { item, history, status, loading, reload } = useModuleDetail<LOARead, WorkflowHistoryEntry, ApplicationStatusResponse>(id, loaApi);

  const onAction = async (action: ActionType, comment?: string) => {
    if (!user) throw new Error('No user selected');
    await loaApi.action(id, action, { comment: comment || null }, user.id);
    await reload();
  };

  return (
    <ModuleDetail
      module="LOA"
      item={item || ({} as LOARead)}
      fields={getDetailFields('LOA', item)}
      onAction={onAction}
      history={history}
      status={status}
      loading={loading}
    />
  );
}
