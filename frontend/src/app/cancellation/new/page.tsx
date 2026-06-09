'use client';
import React from 'react';
import { ModuleForm } from '@/components/ModuleForm';
import { cancellationApi } from '@/lib/api';
import type { CancellationCreate } from '@/types';

const fields = [
  { name: 'applicant_name', label: 'Applicant Name', required: true },
  { name: 'reference_application_id', label: 'Reference Application ID', required: true },
  { name: 'reference_application_type', label: 'Reference Application Type', required: true },
  { name: 'reason', label: 'Reason', type: 'textarea' as const, required: true },
];

export default function CreateCancellationPage() {
  return <ModuleForm module="CANCELLATION" fields={fields} onSubmit={(data, userId) => cancellationApi.create(data as CancellationCreate, userId)} />;
}
