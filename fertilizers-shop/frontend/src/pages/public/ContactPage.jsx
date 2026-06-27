import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchSiteSettings, submitContactMessage } from "../../api/settings";
import { buildWaUrl } from "../../utils/whatsapp";


export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: fetchSiteSettings,
  });

  const phone = settings?.phone || "+91-98765-43210";
  const email = settings?.email || "info@AgroPlus.in";
  const address = settings?.address || "123 Agriculture Road, Hyderabad, Telangana 500001";
  const hours = settings?.businessHours || "Mon–Sat: 9:00 AM – 6:00 PM";
  const waNumber = settings?.whatsappNumber || "919876543210";

  // Build WhatsApp URL using sanitized number
  const buildWhatsAppMsg = () => {
    const text = form.message
      ? `Hi AgroPlus! My name is ${form.name || "[name]"} (${form.phone || "[phone]"}). ${form.message}`
      : `Hi AgroPlus! I'd like to enquire about your fertilizer products.`;
    return buildWaUrl(waNumber, text);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitContactMessage(form);
      setSent(true);
      setForm({ name: "", email: "", phone: "", message: "" });
      toast.success("Message sent successfully!");
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const CONTACTS = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      label: "Phone / Order", value: phone, href: `tel:${phone}`, color: "text-green-600",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      label: "Email", value: email, href: `mailto:${email}`, color: "text-blue-600",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: "Address", value: address, href: null, color: "text-red-500",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: "Business Hours", value: hours, href: null, color: "text-amber-600",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <div className="bg-hero-gradient py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <h1 className="text-5xl font-heading font-bold text-white mb-3">Contact Us</h1>
          <p className="text-green-200 text-lg">We're here to help you grow better</p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid md:grid-cols-2 gap-14">

        {/* ── Left: Contact Info ── */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-2xl font-heading font-bold text-gray-800 mb-6">Get in Touch</h2>

          <div className="space-y-4 mb-8">
            {CONTACTS.map(({ icon, label, value, href, color }) => (
              <div key={label} className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-green-200 transition-colors">
                <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm ${color} flex-shrink-0`}>
                  {icon}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
                  {href ? (
                    <a href={href} className="text-gray-800 font-semibold hover:text-brand-green transition-colors">{value}</a>
                  ) : (
                    <p className="text-gray-800 font-medium">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* WhatsApp Chat Button */}
          <a
            href={buildWhatsAppMsg()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-bold text-white text-lg shadow-lg shadow-green-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] mb-4"
            style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
            id="whatsapp-chat-btn"
          >
            {/* WhatsApp SVG */}
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chat on WhatsApp
          </a>

          {/* Call CTA */}
          <a href={`tel:${phone}`} className="btn-primary w-full justify-center py-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            Call to Order — {phone}
          </a>
        </motion.div>

        {/* ── Right: Contact Form ── */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-2xl font-heading font-bold text-gray-800 mb-6">Send a Message</h2>

          {sent ? (
            <motion.div
              className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-xl font-bold text-brand-green mb-2">Message Received!</h3>
              <p className="text-gray-600 mb-2">We'll get back to you shortly.</p>
              <p className="text-sm text-gray-500 mb-5">For faster response, chat on WhatsApp or call us directly.</p>
              <div className="flex gap-3">
                <a href={buildWhatsAppMsg()} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-white text-sm"
                  style={{ background: "#25D366" }}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  WhatsApp
                </a>
                <button onClick={() => setSent(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                  Send Another
                </button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label text-gray-700">Your Name <span className="text-red-500">*</span></label>
                <input className="input-field text-gray-900 placeholder-gray-400" type="text" placeholder="Enter your full name"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required id="contact-name" />
              </div>
              <div>
                <label className="label text-gray-700">Email Address <span className="text-red-500">*</span></label>
                <input className="input-field text-gray-900 placeholder-gray-400" type="email" placeholder="your@email.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required id="contact-email" />
              </div>
              <div>
                <label className="label text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                <input className="input-field text-gray-900 placeholder-gray-400" type="tel" placeholder="+91-XXXXXXXXXX"
                  value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required id="contact-phone" />
              </div>
              <div>
                <label className="label text-gray-700">Message <span className="text-red-500">*</span></label>
                <textarea className="input-field text-gray-900 placeholder-gray-400 resize-none" rows={4}
                  placeholder="Tell us what products you need, quantity, location..."
                  value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required id="contact-message" />
              </div>

              {/* Single action button — WhatsApp is already above */}
              <div className="pt-2">
                <button type="submit" disabled={loading}
                  className="btn-primary w-full justify-center py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
                  id="contact-submit">
                  {loading ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  )}
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center pt-1">
                We'll reply within 24 hours · Or chat instantly on WhatsApp above
              </p>

            </form>
          )}
        </motion.div>
      </div>

      {/* Admin Portal Link — subtle at bottom */}
      <div className="text-center pb-8">
        <a href="/admin/login" className="text-xs text-gray-300 hover:text-gray-500 transition-colors">
          ⚙ Admin Portal
        </a>
      </div>
    </div>
  );
}
