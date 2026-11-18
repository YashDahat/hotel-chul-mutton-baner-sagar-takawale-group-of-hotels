// Chul Mutton site-layer API: kitchen board, slots, order details, feast calendar, ideas, live earn rules.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';
import { withToast } from '@/lib/apiToast';
import type { BulkUploadResult } from '@/types/bulkUpload';

export const CHUL = 'chul-order';
export const TABLE = 'table-booking';
export const FEAST = 'feast-order';

// ── Types ──
export interface Blackout { id: number; date: string; reason?: string | null; appliesTo: string }
export interface Handi { id: number; name: string; slug: string; left: number }
export interface KitchenStatus {
  mode: 'OPEN' | 'CLOSED_TODAY' | 'CLOSED_UNTIL';
  reopensOn?: string | null;
  message?: string | null;
  lunchOpen?: string | null;
  lunchClose?: string | null;
  dinnerOpen?: string | null;
  dinnerClose?: string | null;
  orderingEnabled: boolean;
  slotCapacity: number;
  leadMinutes: number;
  openNow: boolean;
  blackouts: Blackout[];
  todaysHandi: Handi[];
}
export interface PickupSlot { time: string; remaining: number }
export interface TableSlot { id: number; date: string; time: string; tables: number; reserved: number; left: number; active: boolean }
export interface FeastDate {
  id: number; name: string; marathiName?: string | null; date: string; preorderOpensOn?: string | null;
  description?: string | null; workflowCode: string; active: boolean;
}
export interface EarnRule { eventType: string; points: number; perDayCap?: number | null; onceOnly: boolean }
export interface StageView { code: string; label: string; ordinal: number; initial: boolean; terminal: boolean; cancellable: boolean; targetMinutes?: number | null }
export interface WorkflowView { code: string; label: string; stages: StageView[] }
export interface StageEvent { stageCode: string; enteredAt: string }
export interface OrderDetail {
  id: number; orderId: number; workflowCode: string; contactName?: string | null; phone?: string | null;
  notes?: string | null; staffNote?: string | null; slotDate?: string | null; slotTime?: string | null;
  teamLunch?: boolean | null; boxCount?: number | null; boxLabels?: string[]; partySize?: number | null;
  occasion?: string | null; eventDate?: string | null; eventTime?: string | null; guestCount?: number | null;
  vegGuestCount?: number | null; budgetPerHead?: number | null; dishIds?: number[]; deliveryAddressText?: string | null;
  createdAt: string; orderNumber?: string | null; stageCode?: string | null; total?: number | null;
}
export interface AttachDetail {
  orderId: number; contactName: string; phone: string; notes?: string;
  slotDate?: string; slotTime?: string; teamLunch?: boolean; boxCount?: number; boxLabels?: string[];
  partySize?: number; occasion?: string;
  eventDate?: string; eventTime?: string; guestCount?: number; vegGuestCount?: number; budgetPerHead?: number;
  dishIds?: number[]; deliveryAddressText?: string;
}
export interface PublicIdea { id: number; text: string; category: string; status: string; publicNote?: string | null; updatedAt: string }
export interface Suggestion { id: number; text: string; category: string; status: string; publicNote?: string | null; showPublic: boolean; createdAt: string; updatedAt: string; userId: number }

// ── Helpers ──
const get = async <T,>(url: string, params?: Record<string, string | undefined>): Promise<T> => (await apiClient.get<T>(url, { params })).data;
const upload = async (url: string, file: File): Promise<BulkUploadResult> => {
  const form = new FormData();
  form.append('file', file);
  return (await apiClient.post<BulkUploadResult>(url, form, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
};

export const isoDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// ── Public hooks ──
export const useKitchenStatus = () =>
  useQuery<KitchenStatus>({ queryKey: ['kitchen-status'], queryFn: () => get('/api/v1/kitchen-status'), refetchInterval: 60_000 });

export const usePickupSlots = (date: string | null) =>
  useQuery<PickupSlot[]>({ queryKey: ['pickup-slots', date], queryFn: () => get('/api/v1/chul-order/slots', { date: date ?? undefined }), enabled: !!date });

export const useTableSlots = (from?: string, to?: string) =>
  useQuery<TableSlot[]>({ queryKey: ['table-slots', from, to], queryFn: () => get('/api/v1/table-slots', { from, to }) });

export const useFeastDates = () => useQuery<FeastDate[]>({ queryKey: ['feast-dates'], queryFn: () => get('/api/v1/feast-dates') });

export const useEarnRules = () => useQuery<EarnRule[]>({ queryKey: ['earn-rules'], queryFn: () => get('/api/v1/site/earn-rules'), staleTime: 300_000 });

export const useWorkflowView = (code: string | null | undefined) =>
  useQuery<WorkflowView>({ queryKey: ['workflow-view', code], queryFn: () => get(`/api/v1/site/workflows/${code}`), enabled: !!code, staleTime: 300_000 });

export const useStageEvents = (orderId: number | null, poll: boolean) =>
  useQuery<StageEvent[]>({ queryKey: ['stage-events', orderId], queryFn: () => get(`/api/v1/site/orders/${orderId}/stages`), enabled: orderId != null, refetchInterval: poll ? 20_000 : false });

export const useOrderDetail = (orderId: number | null) =>
  useQuery<OrderDetail | null>({
    queryKey: ['order-detail-site', orderId],
    queryFn: async () => (await apiClient.get<OrderDetail | ''>(`/api/v1/order-details/${orderId}`)).data || null,
    enabled: orderId != null,
  });

export const attachOrderDetail = async (req: AttachDetail): Promise<OrderDetail> =>
  (await apiClient.post<OrderDetail>('/api/v1/order-details', req)).data;

export const usePublicIdeas = () => useQuery<PublicIdea[]>({ queryKey: ['ideas-public'], queryFn: () => get('/api/v1/suggestions/public') });
export const useMySuggestions = (enabled: boolean) => useQuery<Suggestion[]>({ queryKey: ['ideas-mine'], queryFn: () => get('/api/v1/suggestions/mine'), enabled });

export function useSendSuggestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b: { text: string; category: string }) => withToast(apiClient.post('/api/v1/suggestions', b), 'Thank you — your idea is with the team'),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ideas-mine'] }); qc.invalidateQueries({ queryKey: ['loyalty-me'] }); },
  });
}

// ── Admin ──
export const adminApi = {
  kitchen: () => get<KitchenStatus>('/api/v1/admin/kitchen-status'),
  saveKitchen: (b: Partial<KitchenStatus>) => apiClient.put<KitchenStatus>('/api/v1/admin/kitchen-status', b).then((r) => r.data),
  blackouts: () => get<Blackout[]>('/api/v1/admin/blackouts'),
  addBlackout: (b: { date: string; reason?: string; appliesTo: string }) => apiClient.post<Blackout>('/api/v1/admin/blackouts', b).then((r) => r.data),
  deleteBlackout: (id: number) => apiClient.delete(`/api/v1/admin/blackouts/${id}`),
  bulkBlackouts: (f: File) => upload('/api/v1/admin/blackouts/bulk-upload', f),
  slots: () => get<TableSlot[]>('/api/v1/admin/table-slots'),
  addSlot: (b: { date: string; time: string; tables: number }) => apiClient.post<TableSlot>('/api/v1/admin/table-slots', b).then((r) => r.data),
  updateSlot: (id: number, b: { tables?: number; active?: boolean }) => apiClient.put<TableSlot>(`/api/v1/admin/table-slots/${id}`, b).then((r) => r.data),
  deleteSlot: (id: number) => apiClient.delete(`/api/v1/admin/table-slots/${id}`),
  generateSlots: (days: number) => apiClient.post<{ created: number }>('/api/v1/admin/table-slots/generate', null, { params: { days } }).then((r) => r.data),
  bulkSlots: (f: File) => upload('/api/v1/admin/table-slots/bulk-upload', f),
  details: (workflowCode: string) => get<OrderDetail[]>('/api/v1/admin/order-details', { workflowCode }),
  saveNote: (orderId: number, note: string) => apiClient.put<OrderDetail>(`/api/v1/admin/order-details/${orderId}/staff-note`, { note }).then((r) => r.data),
  feasts: () => get<FeastDate[]>('/api/v1/admin/feast-dates'),
  saveFeast: (id: number | null, b: Partial<FeastDate>) => (id == null
    ? apiClient.post<FeastDate>('/api/v1/admin/feast-dates', b) : apiClient.put<FeastDate>(`/api/v1/admin/feast-dates/${id}`, b)).then((r) => r.data),
  deleteFeast: (id: number) => apiClient.delete(`/api/v1/admin/feast-dates/${id}`),
  bulkFeasts: (f: File) => upload('/api/v1/admin/feast-dates/bulk-upload', f),
  suggestions: () => get<Suggestion[]>('/api/v1/admin/suggestions'),
  triage: (id: number, b: { status?: string; publicNote?: string; showPublic?: boolean }) => apiClient.put<Suggestion>(`/api/v1/admin/suggestions/${id}`, b).then((r) => r.data),
  bulkSuggestions: (f: File) => upload('/api/v1/admin/suggestions/bulk-upload', f),
};

/** Small admin list/mutate helper: one query + a toast-wrapped mutation that refreshes it. */
export function useAdminList<T>(key: string, fn: () => Promise<T>) {
  return useQuery<T>({ queryKey: ['admin-site', key], queryFn: fn });
}
export function useAdminMutation<A>(key: string, fn: (a: A) => Promise<unknown>, message: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (a: A) => withToast(fn(a), message),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-site', key] }); qc.invalidateQueries({ queryKey: ['kitchen-status'] }); },
  });
}
