'use client';
import React from 'react';
import { ModuleForm } from '@/components/ModuleForm';
import { loaApi } from '@/lib/api';
import { LOA_FIELDS } from '@/constants';
import type { LOACreate } from '@/types';

export default function CreateLOAPage() {
  return (
    <ModuleForm
      module="LOA"
      fields={LOA_FIELDS}
      onSubmit={(data, userId) => loaApi.create(data as LOACreate, userId)}
    />
  );
}
