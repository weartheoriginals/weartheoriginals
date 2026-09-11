"use client";

import type { ApiResponse, OrderStatus, TrackedOrder } from "@/lib/types";
import { CircleCheck, Mail, Package, Truck } from "lucide-react";
import { useState, type FormEvent } from "react";

const STAGES: { key: OrderStatus; label: string }[] = [
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "dispatched", label: "Dispatched" },
  { key: "in_transit", label: "In Transit" },
  { key: "delivered", label: "Delivered" },
];

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  confirmed: "Your order has been confirmed and will be processed shortly.",
  processing: "Your order is being prepared.",
  dispatched: "Your order has left our workshop.",
  in_transit:
    "Your order is on its way! It's currently in transit and expected to arrive soon.",
  delivered: "Your order has been delivered.",
  cancelled: "This order has been cancelled.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function OrderTrackingForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_number: orderNumber, email }),
      });
      const json: ApiResponse<TrackedOrder> = await res.json();

      if (!json.success) {
        setError(json.error);
        setOrder(null);
      } else {
        setOrder(json.data);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  const historyMap = new Map(
    (order?.order_status_history ?? []).map((h) => [h.status, h.happened_at]),
  );
  const currentStageIndex = order
    ? STAGES.findIndex((s) => s.key === order.status)
    : -1;
  const isCancelled = order?.status === "cancelled";

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Left: form */}
      <div className="border border-espresso/10 bg-white p-8">
        <h2 className="font-mono-label text-[11px] uppercase text-brass mb-6">
          Track Your Order
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3 border border-espresso/15 px-3 h-12">
            <Package className="w-4 h-4 text-umber/50 shrink-0" />
            <div className="flex-1">
              <label className="block text-[11px] text-umber/60">
                Order Number
              </label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. OGNLS12345"
                className="w-full bg-transparent text-sm text-espresso placeholder:text-umber/40 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 border border-espresso/15 px-3 h-12">
            <Mail className="w-4 h-4 text-umber/50 shrink-0" />
            <div className="flex-1">
              <label className="block text-[11px] text-umber/60">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent text-sm text-espresso placeholder:text-umber/40 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-espresso text-ivory font-mono-label text-[11px] uppercase tracking-wide hover:bg-espresso/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Tracking..." : "Track Order →"}
          </button>
        </form>
      </div>

      {/* Right: status card */}
      <div className="border border-espresso/10 bg-[#f0ede7] p-8">
        <h2 className="font-mono-label text-[11px] uppercase text-brass mb-2">
          {order ? "Order Status" : "Order Status"}
        </h2>
        <p className="font-display text-xl text-espresso mb-6">
          {order
            ? `Order #${order.order_number}`
            : "Enter your details to see status"}
        </p>

        <div className="flex items-start justify-between mb-6">
          {STAGES.map((stage, i) => {
            const reached = order && !isCancelled && i <= currentStageIndex;
            const isCurrent = order && !isCancelled && i === currentStageIndex;
            const date = historyMap.get(stage.key);

            return (
              <div
                key={stage.key}
                className="flex flex-col items-center flex-1 relative"
              >
                {i > 0 && (
                  <div
                    className={`absolute top-4 right-1/2 w-full h-px ${
                      reached ? "bg-espresso" : "bg-espresso/15"
                    }`}
                  />
                )}
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                    reached
                      ? "bg-espresso text-ivory"
                      : "bg-transparent border border-espresso/20 text-umber/30"
                  }`}
                >
                  {isCurrent ? (
                    <Truck className="w-4 h-4" />
                  ) : reached ? (
                    <CircleCheck className="w-4 h-4" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-current" />
                  )}
                </div>
                <p className="font-mono-label text-[10px] uppercase text-espresso mt-2 text-center">
                  {stage.label}
                </p>
                <p className="text-[11px] text-umber/50 mt-0.5">
                  {date ? formatDate(date) : "—"}
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex items-start gap-3 border border-espresso/10 bg-white p-4">
          <Truck className="w-4 h-4 text-umber/50 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-espresso font-medium">
              {order
                ? isCancelled
                  ? "Order cancelled"
                  : currentStageIndex === STAGES.length - 1
                    ? "Delivered!"
                    : "Your order is on its way!"
                : "No order looked up yet"}
            </p>
            <p className="text-xs text-umber/60 mt-1">
              {order
                ? STATUS_MESSAGES[order.status]
                : "Enter your order number and email to see live status here."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
