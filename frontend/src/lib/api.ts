const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8011/api/v1';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(detail.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Users ──
import type {
  UserCreate,
  UserResponse,
  NOCCreate,
  NOCRead,
  LOACreate,
  LOARead,
  FinanceCreate,
  FinanceRead,
  RentalCreate,
  RentalRead,
  CancellationCreate,
  CancellationRead,
  ApplicationStatusResponse,
  WorkflowHistoryEntry,
  WorkflowActionRequest,
} from '@/types';

export const usersApi = {
  list: () => request<UserResponse[]>('/users'),
  get: (id: number) => request<UserResponse>(`/users/${id}`),
  create: (data: UserCreate) =>
    request<UserResponse>('/users', { method: 'POST', body: JSON.stringify(data) }),
};

// ── NOC ──
export const nocApi = {
  list: () => request<NOCRead[]>('/noc/'),
  get: (id: string) => request<NOCRead>(`/noc/${id}`),
  create: (data: NOCCreate, userId: number) =>
    request<NOCRead>(`/noc/?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getHistory: (id: string) =>
    request<WorkflowHistoryEntry[]>(`/noc/${id}/history`),
  getStatus: (id: string) =>
    request<ApplicationStatusResponse>(`/noc/${id}/status`),
  action: (id: string, action: string, data: WorkflowActionRequest, userId: number) =>
    request<any>(`/noc/${id}/${action.toLowerCase()}?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ── LOA ──
export const loaApi = {
  list: () => request<LOARead[]>('/loa/'),
  get: (id: string) => request<LOARead>(`/loa/${id}`),
  create: (data: LOACreate, userId: number) =>
    request<LOARead>(`/loa/?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getHistory: (id: string) => request<WorkflowHistoryEntry[]>(`/loa/${id}/history`),
  getStatus: (id: string) => request<ApplicationStatusResponse>(`/loa/${id}/status`),
  action: (id: string, action: string, data: WorkflowActionRequest, userId: number) =>
    request<any>(`/loa/${id}/${action.toLowerCase()}?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ── Finance ──
export const financeApi = {
  list: () => request<FinanceRead[]>('/finance/'),
  get: (id: string) => request<FinanceRead>(`/finance/${id}`),
  create: (data: FinanceCreate, userId: number) =>
    request<FinanceRead>(`/finance/?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getHistory: (id: string) =>
    request<WorkflowHistoryEntry[]>(`/finance/${id}/history`),
  getStatus: (id: string) =>
    request<ApplicationStatusResponse>(`/finance/${id}/status`),
  action: (id: string, action: string, data: WorkflowActionRequest, userId: number) =>
    request<any>(`/finance/${id}/${action.toLowerCase()}?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ── Rental ──
export const rentalApi = {
  list: () => request<RentalRead[]>('/rental/'),
  get: (id: string) => request<RentalRead>(`/rental/${id}`),
  create: (data: RentalCreate, userId: number) =>
    request<RentalRead>(`/rental/?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getHistory: (id: string) =>
    request<WorkflowHistoryEntry[]>(`/rental/${id}/history`),
  getStatus: (id: string) =>
    request<ApplicationStatusResponse>(`/rental/${id}/status`),
  action: (id: string, action: string, data: WorkflowActionRequest, userId: number) =>
    request<any>(`/rental/${id}/${action.toLowerCase()}?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ── Cancellation ──
export const cancellationApi = {
  list: () => request<CancellationRead[]>('/cancellation/'),
  get: (id: string) => request<CancellationRead>(`/cancellation/${id}`),
  create: (data: CancellationCreate, userId: number) =>
    request<CancellationRead>(`/cancellation/?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getHistory: (id: string) =>
    request<WorkflowHistoryEntry[]>(`/cancellation/${id}/history`),
  getStatus: (id: string) =>
    request<ApplicationStatusResponse>(`/cancellation/${id}/status`),
  action: (id: string, action: string, data: WorkflowActionRequest, userId: number) =>
    request<any>(`/cancellation/${id}/${action.toLowerCase()}?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
