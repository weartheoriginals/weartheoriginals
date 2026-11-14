export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  awaiting_payment: 'Awaiting payment',
  payment_review: 'Payment under review',
  confirmed: 'Confirmed',
  processing: 'Processing',
  dispatched: 'Dispatched',
  in_transit: 'In transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-stone-100 text-stone-700',
  awaiting_payment: 'bg-amber-100 text-amber-800',
  payment_review: 'bg-orange-100 text-orange-800',
  confirmed: 'bg-sky-100 text-sky-800',
  processing: 'bg-indigo-100 text-indigo-800',
  dispatched: 'bg-violet-100 text-violet-800',
  in_transit: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'payment_review', label: 'Under review' },
  { key: 'awaiting_payment', label: 'Awaiting payment' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'in_transit', label: 'In transit' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

// The one forward step allowed from each status.
export const NEXT_STEP: Record<string, { status: string; label: string } | undefined> = {
  pending: { status: 'confirmed', label: 'Mark payment verified' },
  awaiting_payment: { status: 'confirmed', label: 'Mark payment verified' },
  payment_review: { status: 'confirmed', label: 'Mark payment verified' },
  confirmed: { status: 'processing', label: 'Start processing' },
  processing: { status: 'dispatched', label: 'Mark dispatched' },
  dispatched: { status: 'in_transit', label: 'Mark in transit' },
  in_transit: { status: 'delivered', label: 'Mark delivered' },
};

// Cancel is allowed only until the order is dispatched.
export const CANCELLABLE = ['pending', 'awaiting_payment', 'payment_review', 'confirmed', 'processing'];

export function canMove(from: string, to: string): boolean {
  if (to === 'cancelled') return CANCELLABLE.includes(from);
  return NEXT_STEP[from]?.status === to;
}

export function paymentState(status: string | null): { label: string; style: string } {
  if (status === 'payment_review') return { label: 'Receipt uploaded', style: 'bg-orange-100 text-orange-800' };
  if (status && ['confirmed', 'processing', 'dispatched', 'in_transit', 'delivered'].includes(status)) {
    return { label: 'Verified', style: 'bg-green-100 text-green-800' };
  }
  if (status === 'cancelled') return { label: '—', style: 'bg-stone-100 text-stone-500' };
  return { label: 'Not paid', style: 'bg-amber-100 text-amber-800' };
}
