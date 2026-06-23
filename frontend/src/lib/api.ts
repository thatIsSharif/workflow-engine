import type {
  User,
  CreateUserPayload,
  NOCRead,
  NOCCreate,
  LOARead,
  LOACreate,
  FinanceRead,
  FinanceCreate,
  RentalRead,
  RentalCreate,
  CancellationRead,
  CancellationCreate,
  ModuleType,
  ApplicationStatus,
  WorkflowHistoryEntry,
  WorkflowTransitionResponse,
} from "./types";

const API_BASE = "/api/v1";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Request failed: ${res.statusText}`);
  }
  return res.json();
}

// Users
export function fetchUsers(): Promise<User[]> {
  return request(`${API_BASE}/users/`);
}

export function createUser(payload: CreateUserPayload): Promise<User> {
  return request(`${API_BASE}/users/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchUser(id: number): Promise<User> {
  return request(`${API_BASE}/users/${id}`);
}

// Generic CRUD
async function listEntities<T>(module: string): Promise<T[]> {
  return request(`${API_BASE}/${module.toLowerCase()}/`);
}

async function getEntity<T>(module: string, id: string): Promise<T> {
  return request(`${API_BASE}/${module.toLowerCase()}/${id}`);
}

async function createEntity<T>(module: string, payload: unknown): Promise<T> {
  return request(`${API_BASE}/${module.toLowerCase()}/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// NOC
export function listNOCs(): Promise<NOCRead[]> {
  return listEntities("NOC");
}
export function getNOC(id: string): Promise<NOCRead> {
  return getEntity("NOC", id);
}
export function createNOC(payload: NOCCreate): Promise<NOCRead> {
  return createEntity("NOC", payload);
}

// LOA
export function listLOAs(): Promise<LOARead[]> {
  return listEntities("LOA");
}
export function getLOA(id: string): Promise<LOARead> {
  return getEntity("LOA", id);
}
export function createLOA(payload: LOACreate): Promise<LOARead> {
  return createEntity("LOA", payload);
}

// Finance
export function listFinance(): Promise<FinanceRead[]> {
  return listEntities("FINANCE");
}
export function getFinance(id: string): Promise<FinanceRead> {
  return getEntity("FINANCE", id);
}
export function createFinance(payload: FinanceCreate): Promise<FinanceRead> {
  return createEntity("FINANCE", payload);
}

// Rental
export function listRentals(): Promise<RentalRead[]> {
  return listEntities("RENTAL");
}
export function getRental(id: string): Promise<RentalRead> {
  return getEntity("RENTAL", id);
}
export function createRental(payload: RentalCreate): Promise<RentalRead> {
  return createEntity("RENTAL", payload);
}

// Cancellation
export function listCancellations(): Promise<CancellationRead[]> {
  return listEntities("CANCELLATION");
}
export function getCancellation(id: string): Promise<CancellationRead> {
  return getEntity("CANCELLATION", id);
}
export function createCancellation(payload: CancellationCreate): Promise<CancellationRead> {
  return createEntity("CANCELLATION", payload);
}

// Workflow
export function getApplicationStatus(module: string, id: string): Promise<ApplicationStatus> {
  return request(`${API_BASE}/${module.toLowerCase()}/${id}/status`);
}

export function getWorkflowHistory(module: string, id: string): Promise<WorkflowHistoryEntry[]> {
  return request(`${API_BASE}/${module.toLowerCase()}/${id}/history`);
}

export function performAction(
  module: string,
  id: string,
  action: string,
  userId: number,
  comment?: string
): Promise<WorkflowTransitionResponse> {
  return request(`${API_BASE}/${module.toLowerCase()}/${id}/${action.toLowerCase()}?user_id=${userId}`, {
    method: "POST",
    body: comment ? JSON.stringify({ comment }) : undefined,
  });
}

// Helper to get entities list by module
export function listByModule(module: ModuleType): Promise<
  NOCRead[] | LOARead[] | FinanceRead[] | RentalRead[] | CancellationRead[]
> {
  switch (module) {
    case "NOC": return listNOCs();
    case "LOA": return listLOAs();
    case "FINANCE": return listFinance();
    case "RENTAL": return listRentals();
    case "CANCELLATION": return listCancellations();
  }
}

export function getByModule(module: ModuleType, id: string): Promise<
  NOCRead | LOARead | FinanceRead | RentalRead | CancellationRead
> {
  switch (module) {
    case "NOC": return getNOC(id);
    case "LOA": return getLOA(id);
    case "FINANCE": return getFinance(id);
    case "RENTAL": return getRental(id);
    case "CANCELLATION": return getCancellation(id);
  }
}
