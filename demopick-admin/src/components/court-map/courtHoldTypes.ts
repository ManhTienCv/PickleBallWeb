export type HoldType = 'customer_hold' | 'maintenance' | 'event';

export interface CourtHoldItem {
  id: string;
  courtId: number;
  courtName: string;
  date: string; // 'yyyy-MM-dd'
  time: string; // '07:00'
  price: number;
  customerName: string;
  customerPhone: string;
  note: string;
  holdType: HoldType;
  durationMinutes: number; // 10, 15, 30, 60 or 0 (permanent/maintenance)
  createdAt: number;
  expiresAt: number | null; // null if permanent/maintenance
  staffName?: string;
}

export interface SelectedSlotItem {
  courtId: number;
  courtName: string;
  time: string;
  price: number;
  date: string;
}

const STORAGE_KEY = 'demopick_court_holds_admin';

export function getCourtHolds(): CourtHoldItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list: CourtHoldItem[] = JSON.parse(raw);
    const now = Date.now();
    // Return only active holds or non-expiring holds
    return list.filter((h) => h.expiresAt === null || h.expiresAt > now);
  } catch {
    return [];
  }
}

export function saveCourtHolds(holds: CourtHoldItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(holds));
    // Dispatch custom event so any listeners or cross-tabs sync immediately
    window.dispatchEvent(new CustomEvent('court_holds_updated', { detail: holds }));
  } catch (err) {
    console.error('Error saving court holds:', err);
  }
}

export function cleanExpiredHolds(): { active: CourtHoldItem[]; expired: CourtHoldItem[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { active: [], expired: [] };
    const list: CourtHoldItem[] = JSON.parse(raw);
    const now = Date.now();

    const active: CourtHoldItem[] = [];
    const expired: CourtHoldItem[] = [];

    list.forEach((h) => {
      if (h.expiresAt !== null && h.expiresAt <= now) {
        expired.push(h);
      } else {
        active.push(h);
      }
    });

    if (expired.length > 0) {
      saveCourtHolds(active);
    }

    return { active, expired };
  } catch {
    return { active: [], expired: [] };
  }
}

export function addCourtHolds(
  items: Array<{
    courtId: number;
    courtName: string;
    date: string;
    time: string;
    price: number;
    customerName: string;
    customerPhone: string;
    note: string;
    holdType: HoldType;
    durationMinutes: number;
    staffName?: string;
  }>
): CourtHoldItem[] {
  const current = getCourtHolds();
  const now = Date.now();

  const newHolds: CourtHoldItem[] = items.map((item, index) => {
    const expiresAt = item.durationMinutes > 0 ? now + item.durationMinutes * 60 * 1000 : null;
    return {
      ...item,
      id: `hold_${now}_${index}_${item.courtId}_${item.time.replace(':', '')}`,
      createdAt: now,
      expiresAt,
    };
  });

  // Filter out any existing holds for the same slot to replace/override
  const keySet = new Set(newHolds.map((n) => `${n.courtId}_${n.date}_${n.time}`));
  const retained = current.filter((c) => !keySet.has(`${c.courtId}_${c.date}_${c.time}`));

  const updated = [...retained, ...newHolds];
  saveCourtHolds(updated);
  return updated;
}

export function removeCourtHold(id: string): CourtHoldItem[] {
  const current = getCourtHolds();
  const updated = current.filter((h) => h.id !== id);
  saveCourtHolds(updated);
  return updated;
}

export function removeCourtHoldsBySlots(slots: Array<{ courtId: number; date: string; time: string }>): CourtHoldItem[] {
  const current = getCourtHolds();
  const keySet = new Set(slots.map((s) => `${s.courtId}_${s.date}_${s.time}`));
  const updated = current.filter((h) => !keySet.has(`${h.courtId}_${h.date}_${h.time}`));
  saveCourtHolds(updated);
  return updated;
}

export function extendCourtHold(id: string, additionalMinutes: number): CourtHoldItem | null {
  const current = getCourtHolds();
  let target: CourtHoldItem | null = null;
  const updated = current.map((h) => {
    if (h.id === id) {
      const baseTime = h.expiresAt && h.expiresAt > Date.now() ? h.expiresAt : Date.now();
      const newExpiresAt = baseTime + additionalMinutes * 60 * 1000;
      target = { ...h, expiresAt: newExpiresAt, durationMinutes: h.durationMinutes + additionalMinutes };
      return target;
    }
    return h;
  });

  if (target) {
    saveCourtHolds(updated);
  }
  return target;
}
