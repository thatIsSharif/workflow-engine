'use client';
import React from 'react';
import { ModuleForm } from '@/components/ModuleForm';
import { financeApi } from '@/lib/api';
import { FINANCE_FIELDS } from '@/constants';
import type { FinanceCreate } from '@/types';

export default function CreateFinancePage() {
  return (
    <ModuleForm
      module="FINANCE"
      fields={FINANCE_FIELDS}
      onSubmit={(data, userId) => financeApi.create(data as FinanceCreate, userId)}
    />
  );
}
