export interface User {
  id: number;
  name: string;
  role: string;
}

export interface CreateUserPayload {
  name: string;
  role: string;
}

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
  supporting_document_ref?: string;
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

export type ModuleType = "NOC" | "LOA" | "FINANCE" | "RENTAL" | "CANCELLATION";

export interface ApplicationStatus {
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

export interface WorkflowTransitionResponse {
  id: string;
  old_state: string;
  new_state: string;
  action: string;
  actioned_by: number;
  pending_roles: string[];
  comment: string | null;
}

export type DomainCreate =
  | NOCCreate
  | LOACreate
  | FinanceCreate
  | RentalCreate
  | CancellationCreate;

export const MODULE_LABELS: Record<ModuleType, string> = {
  NOC: "NOC",
  LOA: "LOA",
  FINANCE: "Finance",
  RENTAL: "Rental",
  CANCELLATION: "Cancellation",
};

export const MODULE_ICONS: Record<ModuleType, string> = {
  NOC: "📋",
  LOA: "📄",
  FINANCE: "💰",
  RENTAL: "🏠",
  CANCELLATION: "❌",
};

export const WORKFLOW_CONFIG: Record<
  ModuleType,
  { states: string[]; transitions: Record<string, { to: string; roles: string[] }> }
> = {
  NOC: {
    states: ["DRAFT", "OFFICER_REVIEW", "CONTROLLER_REVIEW", "HEAD_APPROVAL", "APPROVED", "REJECTED"],
    transitions: {
      "DRAFT:SUBMIT": { to: "OFFICER_REVIEW", roles: ["PRO"] },
      "OFFICER_REVIEW:APPROVE": { to: "CONTROLLER_REVIEW", roles: ["OFFICER"] },
      "OFFICER_REVIEW:REJECT": { to: "REJECTED", roles: ["OFFICER"] },
      "OFFICER_REVIEW:REVERT": { to: "DRAFT", roles: ["OFFICER"] },
      "CONTROLLER_REVIEW:APPROVE": { to: "HEAD_APPROVAL", roles: ["CONTROLLER"] },
      "CONTROLLER_REVIEW:REJECT": { to: "REJECTED", roles: ["CONTROLLER"] },
      "CONTROLLER_REVIEW:REVERT": { to: "OFFICER_REVIEW", roles: ["CONTROLLER"] },
      "HEAD_APPROVAL:APPROVE": { to: "APPROVED", roles: ["HEAD"] },
      "HEAD_APPROVAL:REJECT": { to: "REJECTED", roles: ["HEAD"] },
      "HEAD_APPROVAL:REVERT": { to: "CONTROLLER_REVIEW", roles: ["HEAD"] },
    },
  },
  LOA: {
    states: ["DRAFT", "ADMIN_REVIEW", "APPROVED", "REJECTED"],
    transitions: {
      "DRAFT:SUBMIT": { to: "ADMIN_REVIEW", roles: ["USER"] },
      "ADMIN_REVIEW:APPROVE": { to: "APPROVED", roles: ["ADMIN"] },
      "ADMIN_REVIEW:REJECT": { to: "REJECTED", roles: ["ADMIN"] },
      "ADMIN_REVIEW:REVERT": { to: "DRAFT", roles: ["ADMIN"] },
    },
  },
  FINANCE: {
    states: ["PENDING", "CONTROLLER_APPROVAL", "FINANCE_CONFIRMATION", "COMPLETED", "REJECTED"],
    transitions: {
      "PENDING:SUBMIT": { to: "CONTROLLER_APPROVAL", roles: ["PRO"] },
      "CONTROLLER_APPROVAL:APPROVE": { to: "FINANCE_CONFIRMATION", roles: ["CONTROLLER"] },
      "CONTROLLER_APPROVAL:REJECT": { to: "REJECTED", roles: ["CONTROLLER"] },
      "CONTROLLER_APPROVAL:REVERT": { to: "PENDING", roles: ["CONTROLLER"] },
      "FINANCE_CONFIRMATION:CONFIRM": { to: "COMPLETED", roles: ["FINANCE"] },
      "FINANCE_CONFIRMATION:REVERT": { to: "CONTROLLER_APPROVAL", roles: ["FINANCE"] },
    },
  },
  RENTAL: {
    states: ["DRAFT", "UNDER_REVIEW", "APPROVED", "SIGNED", "REJECTED"],
    transitions: {
      "DRAFT:SUBMIT": { to: "UNDER_REVIEW", roles: ["USER"] },
      "UNDER_REVIEW:APPROVE": { to: "APPROVED", roles: ["CONTROLLER"] },
      "UNDER_REVIEW:REJECT": { to: "REJECTED", roles: ["CONTROLLER"] },
      "UNDER_REVIEW:REVERT": { to: "DRAFT", roles: ["CONTROLLER"] },
      "APPROVED:SIGN": { to: "SIGNED", roles: ["PRO"] },
    },
  },
  CANCELLATION: {
    states: ["REQUESTED", "UNDER_REVIEW", "APPROVED", "REJECTED"],
    transitions: {
      "REQUESTED:SUBMIT": { to: "UNDER_REVIEW", roles: ["USER"] },
      "UNDER_REVIEW:APPROVE": { to: "APPROVED", roles: ["ADMIN"] },
      "UNDER_REVIEW:REJECT": { to: "REJECTED", roles: ["ADMIN"] },
      "UNDER_REVIEW:REVERT": { to: "REQUESTED", roles: ["ADMIN"] },
    },
  },
};

export function getAvailableActions(
  module: ModuleType,
  currentState: string,
  userRole: string
): string[] {
  const config = WORKFLOW_CONFIG[module];
  if (!config) return [];

  const actions: string[] = [];
  for (const [key, transition] of Object.entries(config.transitions)) {
    const [state, action] = key.split(":");
    if (state === currentState && transition.roles.includes(userRole)) {
      actions.push(action);
    }
  }
  return actions;
}

export function isTerminalState(module: ModuleType, state: string): boolean {
  const config = WORKFLOW_CONFIG[module];
  if (!config) return false;
  // Terminal states are those with no outgoing transitions
  return !Object.keys(config.transitions).some((key) => key.startsWith(state + ":"));
}
