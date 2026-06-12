'use client';
import React from 'react';
import { ModuleForm } from '@/components/ModuleForm';
import { rentalApi } from '@/lib/api';
import { RENTAL_FIELDS } from '@/constants';
import type { RentalCreate } from '@/types';

export default function CreateRentalPage() {
  return <ModuleForm module="RENTAL" fields={RENTAL_FIELDS} onSubmit={(data, userId) => rentalApi.create(data as RentalCreate, userId)} />;
}
