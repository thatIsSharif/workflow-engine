'use client';

import React from 'react';
import { ModuleForm } from '@/components/ModuleForm';
import { loaApi } from '@/lib/api';
import type { LOACreate } from '@/types';

const fields = [
  { name: 'applicant_name', label: 'Applicant Name', required: true },
  { name: 'applicant_email', label: 'Applicant Email', type: 'email' as const, required: true },
  { name: 'authorized_person_name', label: 'Authorized Person Name', required: true },
  { name: 'authorized_person_id', label: 'Authorized Person ID', required: true },
  { name: 'scope_of_authorization', label: 'Scope of Authorization', type: 'textarea' as const, required: true },
  { name: 'valid_from', label: 'Valid From', type: 'date' as const, required: true },
  { name: 'valid_to', label: 'Valid To', type: 'date' as const, required: true },
];

export default function CreateLOAPage() {
  return (
    <ModuleForm
      module="LOA"
      fields={fields}
      onSubmit={(data, userId) => loaApi.create(data as LOACreate, userId)}
    />
  );
}
