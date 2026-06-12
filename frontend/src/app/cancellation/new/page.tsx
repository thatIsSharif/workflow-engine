'use client';
import React from 'react';
import { ModuleForm } from '@/components/ModuleForm';
import { cancellationApi } from '@/lib/api';
import { CANCELLATION_FIELDS } from '@/constants';
import type { CancellationCreate } from '@/types';

export default function CreateCancellationPage() {
  return <ModuleForm module="CANCELLATION" fields={CANCELLATION_FIELDS} onSubmit={(data, userId) => cancellationApi.create(data as CancellationCreate, userId)} />;
}
