'use client';

import React from 'react';
import { ModuleForm } from '@/components/ModuleForm';
import { nocApi } from '@/lib/api';
import type { NOCCreate } from '@/types';

const fields = [
  { name: 'applicant_name', label: 'Applicant Name', required: true },
  { name: 'applicant_email', label: 'Applicant Email', type: 'email' as const, required: true },
  { name: 'purpose', label: 'Purpose', type: 'textarea' as const, required: true },
  { name: 'property_address', label: 'Property Address', type: 'textarea' as const, required: true },
  { name: 'valid_from', label: 'Valid From', type: 'date' as const, required: true },
  { name: 'valid_to', label: 'Valid To', type: 'date' as const, required: true },
];

export default function CreateNOCPage() {
  return (
    <ModuleForm
      module="NOC"
      fields={fields}
      onSubmit={(data, userId) => nocApi.create(data as NOCCreate, userId)}
    />
  );
}
