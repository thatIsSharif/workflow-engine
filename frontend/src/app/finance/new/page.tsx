'use client';
import React from 'react';
import { ModuleForm } from '@/components/ModuleForm';
import { financeApi } from '@/lib/api';
import type { FinanceCreate } from '@/types';

const fields = [
  { name: 'applicant_name', label: 'Applicant Name', required: true },
  { name: 'department', label: 'Department', required: true },
  { name: 'amount', label: 'Amount', type: 'number' as const, required: true, min: 0.01, step: 0.01 },
  { name: 'purpose', label: 'Purpose', type: 'textarea' as const, required: true },
  { name: 'supporting_document_ref', label: 'Supporting Document Ref' },
];

export default function CreateFinancePage() {
  return (
    <ModuleForm
      module="FINANCE"
      fields={fields}
      onSubmit={(data, userId) => financeApi.create(data as FinanceCreate, userId)}
    />
  );
}
