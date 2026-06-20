// ── Workflow Configuration Types ──
export interface WorkflowTransition {
  to: string;
  roles: string[];
}

export type WorkflowTransitions = Record<string, WorkflowTransition>;

export interface WorkflowConfig {
  states: string[];
  transitions: WorkflowTransitions;
}

export type WorkflowConfigs = Record<string, WorkflowConfig>;

// ── Domain Entity Types ──
export interface DomainReadBase {
  id: string;
  status: string;
  version: number;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface NOCCreate {
  applicant_name: string;
  applicant_email: string;
  purpose: string;
  property_address: string;
  valid_from: string;
  valid_to: string;
}

export interface NOCRead extends NOCCreate, DomainReadBase {}

export interface LOACreate {
  applicant_name: string;
  applicant_email: string;
  authorized_person_name: string;
  authorized_person_id: string;
  scope_of_authorization: string;
  valid_from: string;
  valid_to: string;
}

export interface LOARead extends LOACreate, DomainReadBase {}

export interface FinanceCreate {
  applicant_name: string;
  department: string;
  amount: number;
  purpose: string;
  supporting_document_ref?: string | null;
}

export interface FinanceRead extends FinanceCreate, DomainReadBase {}

export interface RentalCreate {
  tenant_name: string;
  tenant_email: string;
  property_address: string;
  rental_amount: number;
  lease_start: string;
  lease_end: string;
}

export interface RentalRead extends RentalCreate, DomainReadBase {}

export interface CancellationCreate {
  applicant_name: string;
  reference_application_id: string;
  reference_application_type: string;
  reason: string;
}

export interface CancellationRead extends CancellationCreate, DomainReadBase {}

// ── User Types ──
export interface UserCreate {
  name: string;
  role: string;
}

export interface UserResponse {
  id: number;
  name: string;
  role: string;
}

// ── Workflow Types ──
export interface WorkflowActionRequest {
  comment?: string | null;
}

export interface ApplicationStatusResponse {
  id: number;
  entity: string;
  entity_id: string;
  current_state: string;
  pending_roles: string;
  actioned_by: number | null;
  last_action: string | null;
  last_comment: string | null;
  submitted_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowHistoryEntry {
  id: number;
  entity: string;
  entity_id: string;
  old_state: string;
  new_state: string;
  action: string;
  submitter_id: number | null;
  actioned_by: number | null;
  comment: string | null;
  timestamp: string;
}

export type ActionType = 'SUBMIT' | 'APPROVE' | 'REJECT' | 'REVERT' | 'SIGN' | 'CONFIRM';

export type ModuleType = 'NOC' | 'LOA' | 'FINANCE' | 'RENTAL' | 'CANCELLATION';

export const MODULE_LABELS: Record<ModuleType, string> = {
  NOC: 'No Objection Certificate',
  LOA: 'Letter of Authorization',
  FINANCE: 'Finance',
  RENTAL: 'Rental',
  CANCELLATION: 'Cancellation',
};

export const MODULE_ICONS: Record<ModuleType, string> = {
  NOC: '🛡️',
  LOA: '📄',
  FINANCE: '💰',
  RENTAL: '🏠',
  CANCELLATION: '❌',
};

export const MODULE_COLORS: Record<ModuleType, string> = {
  NOC: 'bg-blue-50 border-blue-200 text-blue-800',
  LOA: 'bg-purple-50 border-purple-200 text-purple-800',
  FINANCE: 'bg-green-50 border-green-200 text-green-800',
  RENTAL: 'bg-orange-50 border-orange-200 text-orange-800',
  CANCELLATION: 'bg-red-50 border-red-200 text-red-800',
};
