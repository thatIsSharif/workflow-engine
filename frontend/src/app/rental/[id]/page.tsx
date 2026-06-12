'use client';
import React, { use } from 'react';
import { rentalApi } from '@/lib/api';
import { ModuleDetail } from '@/components/ModuleDetail';
import { useUser } from '@/lib/UserContext';
import { useModuleDetail } from '@/hooks/useModuleDetail';
import { getDetailFields } from '@/constants';
import type { RentalRead, WorkflowHistoryEntry, ApplicationStatusResponse, ActionType } from '@/types';

export default function RentalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useUser();
  const { item, history, status, loading, reload } = useModuleDetail<RentalRead, WorkflowHistoryEntry, ApplicationStatusResponse>(id, rentalApi);

  const onAction = async (action: ActionType, comment?: string) => {
    if (!user) throw new Error('No user selected');
    await rentalApi.action(id, action, { comment: comment || null }, user.id);
    await reload();
  };

  return <ModuleDetail module="RENTAL" item={item || ({} as RentalRead)} fields={getDetailFields('RENTAL', item)} onAction={onAction} history={history} status={status} loading={loading} />;
}
