import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  adminGetMessages, adminMarkMessageRead, adminMarkAllRead,
  adminDeleteMessage, adminDeleteAllMessages, adminSendEmailReply,
} from "../../api/settings";
import { buildWaUrl } from "../../utils/whatsapp";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminNotificationsPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showClearAll, setShowClearAll] = useState(false);
  const [emailModal, setEmailModal] = useState(null); // { id, name, email }
  const [emailForm, setEmailForm] = useState({ subject: "", body: "" });
  const [emailSending, setEmailSending] = useState(false);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: adminGetMessages,
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: adminMarkMessageRead,
    onSuccess: () => {
      qc.invalidateQueries(["admin-messages"]);
      qc.invalidateQueries(["admin-unread-count"]);
    },
  });

  const markAllMutation = useMutation({
    mutationFn: adminMarkAllRead,
    onSuccess: () => {
      toast.success("All marked as read");
      qc.invalidateQueries(["admin-messages"]);
      qc.invalidateQueries(["admin-unread-count"]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteMessage,
    onSuccess: () => {
      toast.success("Message deleted");
      qc.invalidateQueries(["admin-messages"]);
      qc.invalidateQueries(["admin-unread-count"]);
      setDeleteId(null);
      if (selected?._id === deleteId) setSelected(null);
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: adminDeleteAllMessages,
    onSuccess: () => {
      toast.success("All notifications cleared");
      qc.invalidateQueries(["admin-messages"]);
      qc.invalidateQueries(["admin-unread-count"]);
      setShowClearAll(false);
      setSelected(null);
    },
  });

  const handleSelect = (msg) => {
    setSelected(msg);
    if (!msg.isRead) markReadMutation.mutate(msg._id);
  };

  const openEmailModal = (msg) => {
    setEmailModal({ id: msg._id, name: msg.name, email: msg.email });
    setEmailForm({
      subject: `Re: Your enquiry at AgroPlus`,
      body: `Dear ${msg.name},\n\nThank you for contacting AgroPlus Fertilizers!\n\n`,
    });
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailForm.subject || !emailForm.body) return toast.error("Subject and message required");
    setEmailSending(true);
    try {
      const res = await adminSendEmailReply(emailModal.id, emailForm);
      toast.success(res.message || "Email sent!");
      setEmailModal(null);
      qc.invalidateQueries(["admin-messages"]);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send email");
    } finally {
      setEmailSending(false);
    }
  };

  const unread = messages.filter((m) => !m.isRead).length;

  // Build WhatsApp reply URL for the admin to message the customer
  const buildReplyWa = (msg) => buildWaUrl(
    msg.phone,
    `Hi ${msg.name}, thank you for contacting AgroPlus Fertilizers! We received your message and will get back to you shortly.`
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-heading font-extrabold text-white tracking-tight flex items-center gap-3">
            Notifications
            {unread > 0 && (
              <span className="text-sm px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                {unread} new
              </span>
            )}
          </h2>
          <p className="text-slate-400 text-sm">{messages.length} total customer messages</p>
        </div>
        <div className="flex gap-2">
          {unread > 0 && (
            <button onClick={() => markAllMutation.mutate()} disabled={markAllMutation.isPending}
              className="admin-btn-outline py-2 px-3 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Mark All Read
            </button>
          )}
          {messages.length > 0 && (
            <button onClick={() => setShowClearAll(true)}
              className="admin-btn-danger py-2 px-3 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Clear All
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="admin-card p-12 text-center text-slate-500">Loading messages...</div>
      ) : messages.length === 0 ? (
        <div className="admin-card p-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.04] flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <p className="text-slate-400 font-medium">No messages yet</p>
          <p className="text-slate-600 text-sm mt-1">Customer messages from the Contact page appear here</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-5">
          {/* List */}
          <div className="lg:col-span-2 space-y-2">
            {messages.map((msg) => (
              <motion.div key={msg._id} layout
                className={`admin-card p-4 cursor-pointer transition-all border ${
                  selected?._id === msg._id ? "border-emerald-500/40 bg-emerald-500/5"
                  : !msg.isRead ? "border-emerald-500/20 bg-white/[0.06]"
                  : "border-white/[0.06] hover:border-white/[0.1]"
                }`}
                onClick={() => handleSelect(msg)}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">
                    {msg.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-semibold truncate ${msg.isRead ? "text-slate-300" : "text-white"}`}>{msg.name}</p>
                      <span className="text-xs text-slate-600 flex-shrink-0">{timeAgo(msg.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{msg.phone} · {msg.email}</p>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{msg.message}</p>
                  </div>
                  {!msg.isRead && <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-1.5" />}
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
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl font-bold">
                        {selected.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">{selected.name}</h3>
                        <p className="text-slate-400 text-sm">{selected.email}</p>
                      </div>
                    </div>
                    <button onClick={() => setDeleteId(selected._id)} className="admin-btn-danger text-xs py-1.5 px-3">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Delete
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Phone</p>
                      <a href={`tel:${selected.phone}`} className="text-white font-medium text-sm hover:text-emerald-400 transition-colors">{selected.phone}</a>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Received</p>
                      <p className="text-white font-medium text-sm">{new Date(selected.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-5">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Message</p>
                    <p className="text-slate-200 leading-relaxed">{selected.message}</p>
                  </div>

                  {/* Reply buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <a href={buildReplyWa(selected)} target="_blank" rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1.5 py-3 rounded-xl font-semibold text-white text-xs transition-all hover:opacity-90"
                      style={{ background: "linear-gradient(135deg,#25D366,#128C7E)" }}>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                      WhatsApp
                    </a>
                    <button onClick={() => openEmailModal(selected)}
                      className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-semibold admin-btn-outline">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      Send Email
                    </button>
                    <a href={`tel:${selected.phone}`}
                      className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-xs font-medium">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      Call
                    </a>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" className="admin-card p-12 text-center h-64 flex flex-col items-center justify-center"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <svg className="w-10 h-10 text-slate-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                  <p className="text-slate-500 text-sm">Select a message to view details</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── Email Modal ── */}
      <AnimatePresence>
        {emailModal && (
          <motion.div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="admin-card p-6 w-full max-w-lg"
              initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92 }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-bold text-lg">Send Email Reply</h3>
                <button onClick={() => setEmailModal(null)} className="text-slate-500 hover:text-slate-300">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-5">
                <p className="text-slate-400 text-xs">To: <span className="text-emerald-400 font-medium">{emailModal.name} &lt;{emailModal.email}&gt;</span></p>
              </div>

              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <label className="admin-label">Subject</label>
                  <input className="admin-input" type="text" value={emailForm.subject}
                    onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })} required />
                </div>
                <div>
                  <label className="admin-label">Message</label>
                  <textarea className="admin-input resize-none" rows={7} value={emailForm.body}
                    onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })} required />
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-amber-400 text-xs">⚠ Make sure you have configured your Gmail address and App Password in <strong>Settings</strong> first.</p>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setEmailModal(null)} className="admin-btn-outline flex-1 py-3 text-sm">Cancel</button>
                  <button type="submit" disabled={emailSending} className="admin-btn flex-1 py-3 text-sm disabled:opacity-60">
                    {emailSending ? "Sending..." : (
                      <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>Send Email</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete One Confirm ── */}
      <AnimatePresence>
        {deleteId && (
          <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="admin-card p-6 max-w-sm w-full text-center"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Delete Message?</h3>
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

      {/* ── Clear All Confirm ── */}
      <AnimatePresence>
        {showClearAll && (
          <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="admin-card p-6 max-w-sm w-full text-center"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Clear All Notifications?</h3>
              <p className="text-slate-400 text-sm mb-5">This will permanently delete all {messages.length} messages. This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowClearAll(false)} className="admin-btn-outline flex-1 py-2.5 text-sm">Cancel</button>
                <button onClick={() => clearAllMutation.mutate()} disabled={clearAllMutation.isPending}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-medium text-sm transition-colors">
                  {clearAllMutation.isPending ? "Clearing..." : "Clear All"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
