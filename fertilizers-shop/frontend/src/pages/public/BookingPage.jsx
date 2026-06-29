import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { fetchProducts } from "../../api/products";
import api, { SERVER_URL } from "../../api";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
/* ── tiny reusable components ───────────────────────────── */
function InputLabel({ children }) {
  return (
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
      {children}
    </label>
  );
}

function StyledInput({ ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50/60 text-gray-800 text-sm font-medium placeholder-gray-300 focus:outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all duration-200 ${props.className || ""}`}
    />
  );
}

function StyledTextarea({ ...props }) {
  return (
    <textarea
      {...props}
      className={`w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50/60 text-gray-800 text-sm font-medium placeholder-gray-300 focus:outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all duration-200 resize-none ${props.className || ""}`}
    />
  );
}

/* ── main component ─────────────────────────────────────── */
export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedId = searchParams.get("product");

  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [geoLocation, setGeoLocation] = useState(null);
  const [success, setSuccess] = useState(false);

  const { data } = useQuery({
    queryKey: ["products-all-booking"],
    queryFn: () => fetchProducts({ search: "", category: "", page: 1, limit: 100 }),
  });
  const products = data?.products || [];

  useEffect(() => {
    if (preselectedId) setCart({ [preselectedId]: 1 });
  }, [preselectedId]);

  const updateCart = (productId, delta) => {
    setCart(prev => {
      const newQty = (prev[productId] || 0) + delta;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: newQty };
    });
  };

  const selectedItems = Object.entries(cart).map(([productId, quantity]) => {
    const p = products.find(prod => prod._id === productId);
    return p ? { ...p, quantity } : null;
  }).filter(Boolean);

  /* ── reverse geocoding ── */
  const handleGetLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setGeoLocation({ lat, lng });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const a = data.address || {};
          const parts = [
            a.house_number,
            a.road || a.pedestrian || a.footway,
            a.neighbourhood || a.suburb || a.residential,
            a.village || a.town || a.city_district || a.county,
            a.city || a.state_district,
            a.state,
            a.postcode,
          ].filter(Boolean);
          setForm((f) => ({ ...f, address: parts.join(", ") }));
          toast.success("📍 Address auto-filled!");
        } catch {
          toast.success("📍 Location is added — please type address.");
        }
        setLocationLoading(false);
      },
      (err) => {
        toast.error(err.code === 1 ? "Location permission denied." : "Could not get location.");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const items = Object.entries(cart).map(([productId, quantity]) => ({ productId, quantity }));
    if (!form.name || !form.phone || !form.address)
      return toast.error("Please fill all required fields");
    if (items.length === 0)
      return toast.error("Please select at least one product");

    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items, location: geoLocation }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ══ SUCCESS SCREEN ══════════════════════════════════════ */
  if (success) {
    return (
      <>
        <Navbar />
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12"
          style={{ background: "linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 50%,#f0fdfa 100%)" }}>
          <motion.div
            className="relative bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center overflow-hidden"
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.45, duration: 0.7 }}
          >
            {/* glow ring */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ background: "radial-gradient(circle at 50% 0%,rgba(52,211,153,0.12),transparent 60%)" }} />
            <motion.div
              className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center shadow-xl"
              style={{ background: "linear-gradient(135deg,#34d399,#059669)" }}
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.6, delay: 0.2 }}
            >
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <h2 className="text-2xl font-heading font-extrabold text-gray-900 mb-2">Booking Confirmed! 🎉</h2>
            <p className="text-gray-500 text-sm mb-1">
              Thank you, <strong className="text-gray-800">{form.name}</strong>!
            </p>
            <p className="text-gray-400 text-sm mb-7">
              Your order for <strong className="text-emerald-600">{selectedItems.length} product(s)</strong> is received.
              We'll call you on <strong className="text-gray-700">{form.phone}</strong> shortly.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/products")}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:border-emerald-400 hover:text-emerald-700 transition-all"
              >
                Browse More
              </button>
              <button
                onClick={() => { setSuccess(false); setForm({ name: "", phone: "", email: "", address: "" }); setCart({}); setGeoLocation(null); }}
                className="flex-1 py-3 rounded-xl text-white text-sm font-bold transition-all"
                style={{ background: "linear-gradient(135deg,#34d399,#059669)" }}
              >
                New Booking
              </button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  /* ══ MAIN PAGE ═══════════════════════════════════════════ */
  return (
    <>
      <Navbar />

      {/* ── Compact Hero Strip ───────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(120deg,#065f46 0%,#047857 40%,#0d9488 100%)",
          padding: "28px 0 56px",
        }}
      >
        {/* decorative blobs */}
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle,#fff,transparent)" }} />
        <div className="absolute bottom-0 left-0 w-72 h-20 opacity-5"
          style={{ background: "radial-gradient(ellipse,#fff,transparent)" }} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white/90 text-xs font-semibold mb-2 backdrop-blur-sm">
                🌿 Quick &amp; Easy Ordering
              </span>
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white leading-tight">
                Book Your Fertilizer
              </h1>
              <p className="text-emerald-200/80 text-sm mt-1">
                Fill the form — our team will reach you shortly.
              </p>
            </div>

            {selectedItems.length > 0 && (
              <motion.div
                className="flex flex-col gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 flex-shrink-0"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {selectedItems.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    {item.image ? (
                      <img src={`${SERVER_URL}${item.image}`} alt={item.name}
                        className="w-8 h-8 rounded-lg object-cover border border-white/30" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-xl">🌿</div>
                    )}
                    <div>
                      <p className="text-white font-bold text-sm leading-tight truncate max-w-[120px]">{item.name}</p>
                      <p className="text-emerald-200 text-xs font-semibold">x{item.quantity}</p>
                    </div>
                  </div>
                ))}
                {selectedItems.length > 2 && (
                  <p className="text-white text-xs font-semibold text-center mt-1">+{selectedItems.length - 2} more</p>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Main Card (floats up over hero) ─────────────── */}
      <div
        className="relative z-10 -mt-8 pb-14"
        style={{ background: "linear-gradient(180deg,#f0fdf4 0%,#f8fafc 100%)" }}
      >
        <div className="max-w-5xl mx-auto px-3 sm:px-6">
          <motion.div
            className="rounded-2xl overflow-hidden"
            style={{
              boxShadow: "0 20px 60px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.06)",
              background: "#fff",
            }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <div className="grid lg:grid-cols-5 min-h-[520px]">

              {/* ═══ LEFT PANEL — Product Picker ═══ */}
              <div
                className="lg:col-span-2 p-5 sm:p-6 flex flex-col"
                style={{
                  background: "linear-gradient(160deg,#064e3b 0%,#065f46 50%,#047857 100%)",
                }}
              >
                <p className="text-xs font-bold text-emerald-300/80 uppercase tracking-widest mb-1">Step 1</p>
                <h2 className="text-lg font-heading font-extrabold text-white mb-0.5">Select Product</h2>
                <p className="text-emerald-300/70 text-xs mb-4">Choose what you want to order</p>

                {/* Selected pills */}
                <AnimatePresence mode="popLayout">
                  {selectedItems.length > 0 ? (
                    <div className="flex flex-col gap-2 mb-4">
                      {selectedItems.map((item) => (
                        <motion.div
                          key={item._id}
                          className="flex items-center gap-3 p-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm"
                          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                          layout
                        >
                          {item.image ? (
                            <img src={`${SERVER_URL}${item.image}`} alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover border border-white/25 flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center text-xl flex-shrink-0">🌿</div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-bold text-sm leading-tight truncate">{item.name}</p>
                            <p className="text-emerald-300 text-xs mt-0.5">${item.price}</p>
                          </div>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center bg-white/10 rounded-lg overflow-hidden flex-shrink-0">
                            <button onClick={() => updateCart(item._id, -1)} className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 transition-colors">-</button>
                            <span className="w-8 text-center text-sm font-bold text-white">{item.quantity}</span>
                            <button onClick={() => updateCart(item._id, 1)} className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 transition-colors">+</button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="mb-4 p-3 rounded-xl border-2 border-dashed border-white/20 text-center">
                      <p className="text-emerald-300/60 text-xs">No product selected</p>
                    </div>
                  )}
                </AnimatePresence>

                {/* Product list */}
                <div
                  className="flex-1 space-y-1.5 overflow-y-auto pr-0.5"
                  style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.15) transparent", maxHeight: 320 }}
                >
                  {products.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="w-6 h-6 border-2 border-emerald-300/40 border-t-emerald-300 rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-emerald-300/50 text-xs">Loading...</p>
                    </div>
                  ) : products.map((p, i) => {
                    const active = !!cart[p._id];
                    return (
                      <motion.button
                        key={p._id}
                        type="button"
                        onClick={() => {
                          if (!active) updateCart(p._id, 1);
                        }}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 border-2 ${
                          active
                            ? "bg-white/20 border-white/40 shadow-lg"
                            : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/15"
                        }`}
                        style={active ? { transform: "translateX(3px)", cursor: "default" } : {}}
                      >
                        {p.image ? (
                          <img src={`${SERVER_URL}${p.image}`} alt={p.name}
                            className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center text-lg flex-shrink-0">🌿</div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-xs font-semibold truncate">{p.name}</p>
                          <p className="text-emerald-300/70 text-[10px]">{p.category}</p>
                        </div>
                        {active && (
                          <svg className="w-4 h-4 text-emerald-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* ═══ RIGHT PANEL — Form ═══ */}
              <div className="lg:col-span-3 p-5 sm:p-7 flex flex-col">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Step 2</p>
                <h2 className="text-xl font-heading font-extrabold text-gray-900 mb-0.5">Your Details</h2>
                <p className="text-gray-400 text-xs mb-5">We'll use this to process your order</p>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 gap-4">
                  {/* Name + Phone row */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <InputLabel>Full Name <span className="text-red-400 normal-case">*</span></InputLabel>
                      <StyledInput
                        type="text" required value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <InputLabel>Phone <span className="text-red-400 normal-case">*</span></InputLabel>
                      <StyledInput
                        type="tel" required value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+91 99999 99999"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <InputLabel>Email <span className="text-gray-300 normal-case font-normal">(optional)</span></InputLabel>
                    <StyledInput
                      type="email" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>

                  {/* Address */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-1.5">
                      <InputLabel>Delivery Address <span className="text-red-400 normal-case">*</span></InputLabel>
                      <motion.button
                        type="button"
                        onClick={handleGetLocation}
                        disabled={locationLoading}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50"
                      >
                        {locationLoading ? (
                          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} className="opacity-25" />
                            <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" className="opacity-75" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                        {locationLoading ? "Detecting…" : "Use My Location"}
                      </motion.button>
                    </div>
                    <StyledTextarea
                      required rows={3}
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="House No., Street, Colony, City, District, Pincode…"
                    />
                    <AnimatePresence>
                      {geoLocation && (
                        <motion.p
                          className="text-[11px] text-emerald-600 font-semibold mt-1.5 flex items-center gap-1"
                          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Location is added
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Warning if no product */}
                  <AnimatePresence>
                    {Object.keys(cart).length === 0 && (
                      <motion.div
                        className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl"
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      >
                        <span className="text-amber-500 text-base">⚠️</span>
                        <p className="text-amber-700 text-xs font-semibold">Please select a product on the left</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={loading || Object.keys(cart).length === 0}
                    whileHover={!loading && Object.keys(cart).length > 0 ? { scale: 1.015, y: -1 } : {}}
                    whileTap={!loading && Object.keys(cart).length > 0 ? { scale: 0.98 } : {}}
                    className="w-full py-3.5 rounded-xl text-white font-bold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
                    style={{
                      background: "linear-gradient(135deg,#059669 0%,#047857 50%,#065f46 100%)",
                      boxShadow: Object.keys(cart).length > 0 ? "0 6px 24px rgba(5,150,105,0.35), 0 2px 8px rgba(0,0,0,0.08)" : "none",
                    }}
                  >
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} className="opacity-25" />
                          <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" className="opacity-75" />
                        </svg>
                        Placing Order…
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Confirm Booking
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </div>
          </motion.div>

          {/* ── trust badges ── */}
          <motion.div
            className="mt-6 flex flex-wrap justify-center gap-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          >
            {[
              { icon: "🔒", text: "Secure & Private" },
              { icon: "⚡", text: "Fast Response" },
              { icon: "🚚", text: "Doorstep Delivery" },
              { icon: "✅", text: "Verified Products" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <span>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <Footer />
    </>
  );
}
