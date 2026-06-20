'use client';
import React from 'react';
import { ModuleForm } from '@/components/ModuleForm';
import { rentalApi } from '@/lib/api';
import type { RentalCreate } from '@/types';

const fields = [
  { name: 'tenant_name', label: 'Tenant Name', required: true },
  { name: 'tenant_email', label: 'Tenant Email', type: 'email' as const, required: true },
  { name: 'property_address', label: 'Property Address', type: 'textarea' as const, required: true },
  { name: 'rental_amount', label: 'Rental Amount', type: 'number' as const, required: true, min: 0.01, step: 0.01 },
  { name: 'lease_start', label: 'Lease Start', type: 'date' as const, required: true },
  { name: 'lease_end', label: 'Lease End', type: 'date' as const, required: true },
];

export default function CreateRentalPage() {
  return <ModuleForm module="RENTAL" fields={fields} onSubmit={(data, userId) => rentalApi.create(data as RentalCreate, userId)} />;
}
