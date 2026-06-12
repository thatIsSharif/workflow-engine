// ── Create Form Field Definitions ──
import type { FieldDef } from '@/components/ModuleForm';

export const CANCELLATION_FIELDS: FieldDef[] = [
  { name: 'applicant_name', label: 'Applicant Name', required: true },
  { name: 'reference_application_id', label: 'Reference Application ID', required: true },
  { name: 'reference_application_type', label: 'Reference Application Type', required: true },
  { name: 'reason', label: 'Reason', type: 'textarea', required: true },
];

export const FINANCE_FIELDS: FieldDef[] = [
  { name: 'applicant_name', label: 'Applicant Name', required: true },
  { name: 'department', label: 'Department', required: true },
  { name: 'amount', label: 'Amount', type: 'number', required: true, min: 0.01, step: 0.01 },
  { name: 'purpose', label: 'Purpose', type: 'textarea', required: true },
  { name: 'supporting_document_ref', label: 'Supporting Document Ref' },
];

export const LOA_FIELDS: FieldDef[] = [
  { name: 'applicant_name', label: 'Applicant Name', required: true },
  { name: 'applicant_email', label: 'Applicant Email', type: 'email', required: true },
  { name: 'authorized_person_name', label: 'Authorized Person Name', required: true },
  { name: 'authorized_person_id', label: 'Authorized Person ID', required: true },
  { name: 'scope_of_authorization', label: 'Scope of Authorization', type: 'textarea', required: true },
  { name: 'valid_from', label: 'Valid From', type: 'date', required: true },
  { name: 'valid_to', label: 'Valid To', type: 'date', required: true },
];

export const NOC_FIELDS: FieldDef[] = [
  { name: 'applicant_name', label: 'Applicant Name', required: true },
  { name: 'applicant_email', label: 'Applicant Email', type: 'email', required: true },
  { name: 'purpose', label: 'Purpose', type: 'textarea', required: true },
  { name: 'property_address', label: 'Property Address', type: 'textarea', required: true },
  { name: 'valid_from', label: 'Valid From', type: 'date', required: true },
  { name: 'valid_to', label: 'Valid To', type: 'date', required: true },
];

export const RENTAL_FIELDS: FieldDef[] = [
  { name: 'tenant_name', label: 'Tenant Name', required: true },
  { name: 'tenant_email', label: 'Tenant Email', type: 'email', required: true },
  { name: 'property_address', label: 'Property Address', type: 'textarea', required: true },
  { name: 'rental_amount', label: 'Rental Amount', type: 'number', required: true, min: 0.01, step: 0.01 },
  { name: 'lease_start', label: 'Lease Start', type: 'date', required: true },
  { name: 'lease_end', label: 'Lease End', type: 'date', required: true },
];

// ── Detail Page Field Definitions ──
import type { FieldDisplay } from '@/components/ModuleDetail';
import type { ModuleType } from '@/types';

export function getDetailFields(module: ModuleType, item: Record<string, any> | null): FieldDisplay[] {
  if (!item) return [];
  const fieldMap: Record<ModuleType, FieldDisplay[]> = {
    NOC: [
      { label: 'Applicant Name', value: item.applicant_name },
      { label: 'Applicant Email', value: item.applicant_email },
      { label: 'Purpose', value: item.purpose },
      { label: 'Property Address', value: item.property_address },
      { label: 'Valid From', value: item.valid_from },
      { label: 'Valid To', value: item.valid_to },
    ],
    LOA: [
      { label: 'Applicant Name', value: item.applicant_name },
      { label: 'Applicant Email', value: item.applicant_email },
      { label: 'Authorized Person', value: item.authorized_person_name },
      { label: 'Authorized Person ID', value: item.authorized_person_id },
      { label: 'Scope of Authorization', value: item.scope_of_authorization },
      { label: 'Valid From', value: item.valid_from },
      { label: 'Valid To', value: item.valid_to },
    ],
    FINANCE: [
      { label: 'Applicant', value: item.applicant_name },
      { label: 'Department', value: item.department },
      { label: 'Amount', value: item.amount ? `$${Number(item.amount).toLocaleString()}` : null },
      { label: 'Purpose', value: item.purpose },
      { label: 'Supporting Document', value: item.supporting_document_ref || 'N/A' },
    ],
    RENTAL: [
      { label: 'Tenant Name', value: item.tenant_name },
      { label: 'Tenant Email', value: item.tenant_email },
      { label: 'Property Address', value: item.property_address },
      { label: 'Rental Amount', value: item.rental_amount ? `$${Number(item.rental_amount).toLocaleString()}/mo` : null },
      { label: 'Lease Start', value: item.lease_start },
      { label: 'Lease End', value: item.lease_end },
    ],
    CANCELLATION: [
      { label: 'Applicant Name', value: item.applicant_name },
      { label: 'Reference Application', value: `${item.reference_application_type}: ${item.reference_application_id}` },
      { label: 'Reason', value: item.reason },
    ],
  };
  return fieldMap[module] || [];
}

// ── Page Titles / UI Strings ──

export const PAGE_TITLES: Record<ModuleType, string> = {
  NOC: 'No Objection Certificates',
  LOA: 'Letters of Authorization',
  FINANCE: 'Finance Requests',
  RENTAL: 'Rental Applications',
  CANCELLATION: 'Cancellation Requests',
};

export const NEW_BUTTON_LABELS: Record<ModuleType, string> = {
  NOC: '+ New NOC',
  LOA: '+ New LOA',
  FINANCE: '+ New Finance Request',
  RENTAL: '+ New Rental',
  CANCELLATION: '+ New Cancellation',
};

export const EMPTY_MESSAGES: Record<ModuleType, { title: string; linkText: string }> = {
  NOC: { title: 'No NOC applications yet.', linkText: 'Create your first NOC' },
  LOA: { title: 'No LOA applications yet.', linkText: 'Create your first LOA' },
  FINANCE: { title: 'No finance requests yet.', linkText: 'Create one' },
  RENTAL: { title: 'No rental applications yet.', linkText: 'Create one' },
  CANCELLATION: { title: 'No cancellation requests yet.', linkText: 'Create one' },
};
