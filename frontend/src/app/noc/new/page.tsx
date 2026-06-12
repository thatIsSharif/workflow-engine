'use client';
import React from 'react';
import { ModuleForm } from '@/components/ModuleForm';
import { nocApi } from '@/lib/api';
import { NOC_FIELDS } from '@/constants';
import type { NOCCreate } from '@/types';

export default function CreateNOCPage() {
  return (
    <ModuleForm
      module="NOC"
      fields={NOC_FIELDS}
      onSubmit={(data, userId) => nocApi.create(data as NOCCreate, userId)}
    />
  );
}
