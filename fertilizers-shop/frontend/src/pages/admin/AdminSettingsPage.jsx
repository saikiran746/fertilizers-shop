import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../store/AuthContext";
import { changePassword, adminGetSettings, adminUpdateSettings, adminTestEmail } from "../../api/settings";


export default function AdminSettingsPage() {
  const { username } = useAuth();
  const qc = useQueryClient();

  // ── Password form ──────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [testResult, setTestResult] = useState(null); // { ok, msg }
  const [testLoading, setTestLoading] = useState(false);

  // ── Site Settings form ─────────────────────────────────────
  const [siteForm, setSiteForm] = useState({ phone: "", whatsappNumber: "", email: "", address: "", businessHours: "", senderEmail: "", senderEmailPassword: "" });

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: adminGetSettings,
  });

  useEffect(() => {
    if (settings) {
      setSiteForm({
        phone: settings.phone || "",
        whatsappNumber: settings.whatsappNumber || "",
        email: settings.email || "",
        address: settings.address || "",
        businessHours: settings.businessHours || "",
        senderEmail: settings.senderEmail || "",
        senderEmailPassword: "", // Never pre-fill — user must type new password to change it
      });
    }

  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: adminUpdateSettings,
    onSuccess: () => {
      toast.success("Settings updated! Changes are live on website.");
      qc.invalidateQueries(["site-settings"]);
      qc.invalidateQueries(["admin-settings"]);
    },
    onError: () => toast.error("Failed to update settings"),
  });

  const handleSiteSubmit = (e) => {
    e.preventDefault();
    setTestResult(null);
    // Only include password in the update if user typed something new
    const payload = { ...siteForm };
    if (!payload.senderEmailPassword) delete payload.senderEmailPassword;
    updateSettingsMutation.mutate(payload);
  };

  const handleTestEmail = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await adminTestEmail();
      setTestResult({ ok: true, msg: res.message });
    } catch (err) {
      setTestResult({ ok: false, msg: err.response?.data?.error || "Test failed" });
    } finally {
      setTestLoading(false);
    }
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 6) return toast.error("New password must be at least 6 characters");
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error("Passwords do not match");
    setPwLoading(true);
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success("Password changed successfully!");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to change password");
    } finally {
      setPwLoading(false);
    }
  };

  const EyeIcon = ({ show }) =>
    show ? (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    );

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-3xl font-heading font-extrabold text-white tracking-tight">Settings</h2>
        <p className="text-slate-400 text-sm mt-1">Manage your admin account and website contact info</p>
      </div>

      {/* ── Account Info ── */}
      <motion.div className="admin-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="font-semibold text-white mb-5">Account Information</h3>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-500/20">
            {(username || "A").charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="text-white font-semibold text-lg">{username || "Admin"}</h4>
            <p className="text-slate-500 text-sm">Administrator</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-1.5">Username</p>
            <p className="text-white font-medium">{username || "admin"}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-1.5">Role</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              <p className="text-white font-medium">Administrator</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Website Contact Info ── */}
      <motion.div className="admin-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white">Website Contact Info</h3>
            <p className="text-slate-500 text-xs mt-0.5">Changes appear instantly on the public website</p>
          </div>
        </div>

        {settingsLoading ? (
          <div className="text-slate-500 text-sm text-center py-6">Loading current settings...</div>
        ) : (
          <form onSubmit={handleSiteSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="admin-label">Phone Number</label>
                <input id="settings-phone" className="admin-input" type="text" placeholder="+91-98765-43210"
                  value={siteForm.phone} onChange={(e) => setSiteForm({ ...siteForm, phone: e.target.value })} />
              </div>
              <div>
                <label className="admin-label">
                  WhatsApp Number
                  <span className="text-slate-600 text-xs ml-1">(digits only, with country code e.g. 919876543210)</span>
                </label>
                <input id="settings-wa" className="admin-input" type="text" placeholder="919876543210"
                  value={siteForm.whatsappNumber} onChange={(e) => setSiteForm({ ...siteForm, whatsappNumber: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="admin-label">Contact Email Address <span className="text-slate-500 text-xs">(shown on website)</span></label>
              <input id="settings-email" className="admin-input" type="email" placeholder="info@AgroPlus.in"
                value={siteForm.email} onChange={(e) => setSiteForm({ ...siteForm, email: e.target.value })} />
            </div>
            <div>
              <label className="admin-label">Address</label>
              <input id="settings-address" className="admin-input" type="text" placeholder="123 Agriculture Road, Hyderabad..."
                value={siteForm.address} onChange={(e) => setSiteForm({ ...siteForm, address: e.target.value })} />
            </div>
            <div>
              <label className="admin-label">Business Hours</label>
              <input id="settings-hours" className="admin-input" type="text" placeholder="Mon–Sat: 9:00 AM – 6:00 PM"
                value={siteForm.businessHours} onChange={(e) => setSiteForm({ ...siteForm, businessHours: e.target.value })} />
            </div>




            <button type="submit" id="settings-site-submit"
              disabled={updateSettingsMutation.isPending}
              className="admin-btn w-full py-3 disabled:opacity-60">
              {updateSettingsMutation.isPending ? "Saving..." : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Save All Settings
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>


      {/* ── Change Password ── */}
      <motion.div className="admin-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
        <h3 className="font-semibold text-white mb-1.5">Change Password</h3>
        <p className="text-slate-500 text-sm mb-6">Update your admin login password</p>
        <form onSubmit={handlePwSubmit} className="space-y-5">
          <div>
            <label className="admin-label">Current Password</label>
            <div className="relative">
              <input id="settings-current-password" className="admin-input pr-11" type={showCurrent ? "text" : "password"}
                placeholder="Enter current password" value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                <EyeIcon show={showCurrent} />
              </button>
            </div>
          </div>
          <div>
            <label className="admin-label">New Password</label>
            <div className="relative">
              <input id="settings-new-password" className="admin-input pr-11" type={showNew ? "text" : "password"}
                placeholder="Min 6 characters" value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} required minLength={6} />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                <EyeIcon show={showNew} />
              </button>
            </div>
          </div>
          <div>
            <label className="admin-label">Confirm New Password</label>
            <input id="settings-confirm-password" className="admin-input" type="password"
              placeholder="Confirm new password" value={pwForm.confirmPassword}
              onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} required />
            {pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
              <p className="text-xs text-red-400 mt-1.5">Passwords do not match</p>
            )}
          </div>
          <button id="settings-submit" type="submit" disabled={pwLoading}
            className="admin-btn w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed">
            {pwLoading ? "Updating..." : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Update Password
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
