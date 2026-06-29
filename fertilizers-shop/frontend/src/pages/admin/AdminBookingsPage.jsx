import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { buildWaUrl } from "../../utils/whatsapp";

const rawBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "/api";
const SERVER_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl.slice(0, -4) : rawBaseUrl;

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminBookingsPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const res = await fetch(`${SERVER_URL}/api/admin/bookings`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
      });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${SERVER_URL}/api/admin/bookings/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries(["admin-bookings"]),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await fetch(`${SERVER_URL}/api/admin/bookings/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,

        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(`Booking marked as ${data.status}`);
      qc.invalidateQueries(["admin-bookings"]);
      if (selected && selected._id === data._id) {
        setSelected(data);
      }
    },
    onError: () => toast.error("Failed to update status"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${SERVER_URL}/api/admin/bookings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Booking deleted");
      qc.invalidateQueries(["admin-bookings"]);
      setDeleteId(null);
      if (selected?._id === deleteId) setSelected(null);
    },
  });

  const handleSelect = (b) => {
    setSelected(b);
    if (!b.read) markReadMutation.mutate(b._id);
  };

  const unread = bookings.filter((b) => !b.read).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-heading font-extrabold text-white tracking-tight flex items-center gap-3">
            Bookings
            {unread > 0 && (
              <span className="text-sm px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                {unread} new
              </span>
            )}
          </h2>
          <p className="text-slate-400 text-sm">{bookings.length} total product bookings</p>
        </div>
      </div>

      {isLoading ? (
        <div className="admin-card p-12 text-center text-slate-500">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="admin-card p-16 text-center">
          <p className="text-slate-400 font-medium">No bookings yet</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-5">
          {/* List */}
          <div className="lg:col-span-2 space-y-2">
            {bookings.map((b) => (
              <motion.div key={b._id} layout
                className={`admin-card p-4 cursor-pointer transition-all border ${
                  selected?._id === b._id ? "border-emerald-500/40 bg-emerald-500/5"
                  : !b.read ? "border-emerald-500/20 bg-white/[0.06]"
                  : "border-white/[0.06] hover:border-white/[0.1]"
                }`}
                onClick={() => handleSelect(b)}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className={`text-sm font-semibold truncate ${b.read ? "text-slate-300" : "text-white"}`}>{b.name}</p>
                    <p className="text-xs text-emerald-400 truncate mt-1">{b.productName}</p>
                    <p className="text-xs text-slate-500 truncate mt-1">{b.phone}</p>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-xs text-slate-600 mb-2">{timeAgo(b.createdAt)}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                      b.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                      b.status === "confirmed" ? "bg-emerald-500/20 text-emerald-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {b.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Detail */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div key={selected._id} className="admin-card p-6"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.25 }}>
                  <div className="flex justify-between mb-6">
                    <div>
                      <h3 className="text-white font-bold text-lg">{selected.name}</h3>
                      <p className="text-slate-400 text-sm">{selected.phone} {selected.email ? `• ${selected.email}` : ""}</p>
                    </div>
                    <button onClick={() => setDeleteId(selected._id)} className="admin-btn-danger text-xs py-1.5 px-3 h-fit">
                      Delete
                    </button>
                  </div>

                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-5">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Product Requested</p>
                    <p className="text-emerald-400 font-medium text-lg">{selected.productName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Status</p>
                      <select
                        value={selected.status}
                        onChange={(e) => updateStatusMutation.mutate({ id: selected._id, status: e.target.value })}
                        disabled={updateStatusMutation.isPending}
                        className="bg-transparent text-white text-sm outline-none w-full"
                      >
                        <option value="pending" className="text-black">Pending</option>
                        <option value="confirmed" className="text-black">Confirmed</option>
                        <option value="cancelled" className="text-black">Cancelled</option>
                      </select>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Date</p>
                      <p className="text-white font-medium text-sm">{new Date(selected.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-5">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Delivery Address</p>
                    <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{selected.address}</p>
                    {selected.location && selected.location.lat && selected.location.lng && (
                      <a href={`https://maps.google.com/?q=${selected.location.lat},${selected.location.lng}`}
                         target="_blank" rel="noopener noreferrer"
                         className="inline-block mt-3 text-sm text-emerald-400 hover:underline">
                        📍 View on Google Maps
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <a href={buildWaUrl(selected.phone, `Hi ${selected.name}, regarding your booking for ${selected.productName}...`)} target="_blank" rel="noopener noreferrer"
                      className="flex-1 text-center py-3 rounded-xl font-semibold text-white text-xs transition-all hover:opacity-90"
                      style={{ background: "linear-gradient(135deg,#25D366,#128C7E)" }}>
                      WhatsApp Customer
                    </a>
                    <a href={`tel:${selected.phone}`}
                      className="flex-1 text-center py-3 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-xs font-medium">
                      Call Customer
                    </a>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" className="admin-card p-12 text-center h-64 flex flex-col items-center justify-center"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p className="text-slate-500 text-sm">Select a booking to view details</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="admin-card p-6 max-w-sm w-full text-center">
              <h3 className="text-lg font-bold text-white mb-2">Delete Booking?</h3>
              <p className="text-slate-400 text-sm mb-5">This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="admin-btn-outline flex-1 py-2.5 text-sm">Cancel</button>
                <button onClick={() => deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-medium text-sm transition-colors">
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
