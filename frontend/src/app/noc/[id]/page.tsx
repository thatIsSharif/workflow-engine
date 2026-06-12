'use client';
import React, { use } from 'react';
import { nocApi } from '@/lib/api';
import { ModuleDetail } from '@/components/ModuleDetail';
import { useUser } from '@/lib/UserContext';
import { useModuleDetail } from '@/hooks/useModuleDetail';
import { getDetailFields } from '@/constants';
import type { NOCRead, WorkflowHistoryEntry, ApplicationStatusResponse, ActionType } from '@/types';

export default function NOCDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useUser();
  const { item, history, status, loading, reload } = useModuleDetail<NOCRead, WorkflowHistoryEntry, ApplicationStatusResponse>(id, nocApi);

  const onAction = async (action: ActionType, comment?: string) => {
    if (!user) throw new Error('No user selected');
    await nocApi.action(id, action, { comment: comment || null }, user.id);
    await reload();
  };

  return (
    <ModuleDetail
      module="NOC"
      item={item || ({} as NOCRead)}
      fields={getDetailFields('NOC', item)}
      onAction={onAction}
      history={history}
      status={status}
      loading={loading}
    />
  );
}
