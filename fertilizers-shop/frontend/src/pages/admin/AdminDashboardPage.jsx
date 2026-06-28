import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { adminFetchEnhancedStats, adminFetchProducts } from "../../api/products";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useAuth } from "../../store/AuthContext";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function AdminDashboardPage() {
  const { username } = useAuth();
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-enhanced-stats"],
    queryFn: adminFetchEnhancedStats,
  });
  const { data: products, isLoading: prodLoading } = useQuery({
    queryKey: ["admin-products-recent"],
    queryFn: adminFetchProducts,
  });
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["admin-bookings-recent"],
    queryFn: async () => {
      const res = await fetch(`${SERVER_URL}/api/admin/bookings/recent`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
      });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json();
    }
  });

  const recent = (products || []).slice(0, 5);
  const recentBookings = bookings || [];
  const maxCat = stats?.categoryStats?.reduce((max, c) => Math.max(max, c.count), 0) || 1;

  const STAT_CARDS = [
    {
      label: "Total Products", value: stats?.total ?? "—",
      gradient: "from-emerald-500/20 to-green-500/10", border: "border-emerald-500/20",
      iconBg: "bg-emerald-500/10", iconColor: "text-emerald-400",
      icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    },
    {
      label: "Visible", value: stats?.visible ?? "—",
      gradient: "from-blue-500/20 to-cyan-500/10", border: "border-blue-500/20",
      iconBg: "bg-blue-500/10", iconColor: "text-blue-400",
      icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    },
    {
      label: "Hidden", value: stats?.hidden ?? "—",
      gradient: "from-amber-500/20 to-orange-500/10", border: "border-amber-500/20",
      iconBg: "bg-amber-500/10", iconColor: "text-amber-400",
      icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>,
    },
    {
      label: "Categories", value: stats?.categoriesCount ?? "—",
      gradient: "from-purple-500/20 to-pink-500/10", border: "border-purple-500/20",
      iconBg: "bg-purple-500/10", iconColor: "text-purple-400",
      icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>,
    },
  ];

  const QUICK_ACTIONS = [
    { label: "Add Product", to: "/admin/products/new", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg> },
    { label: "View All Products", to: "/admin/products", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg> },
    { label: "Settings", to: "/admin/settings", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  ];

  return (
    <div>
      {/* Greeting Banner */}
      <motion.div
        className="admin-card p-6 mb-8 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="relative">
          <h2 className="text-3xl font-heading font-extrabold text-white tracking-tight">
            {getGreeting()}, {username || "Admin"} 👋
          </h2>
          <p className="text-slate-400 text-sm mt-1">Here's what's happening with your <span className="text-emerald-400 font-medium">AgroPlus</span> catalog today.</p>
          <div className="mt-4">
            <Link to="/admin/products/new" className="admin-btn py-2.5 px-5 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Add Product
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      {statsLoading ? (
        <div className="mb-8"><LoadingSpinner /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STAT_CARDS.map((card, i) => (
            <motion.div
              key={card.label}
              className={`admin-card p-5 bg-gradient-to-br ${card.gradient} border ${card.border}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className={`w-10 h-10 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center mb-3`}>
                {card.icon}
              </div>
              <div className="text-3xl font-heading font-bold text-white">{card.value}</div>
              <div className="text-slate-400 text-sm mt-1">{card.label}</div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Products — spans 2 cols */}
        <div className="lg:col-span-2 admin-card overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="font-semibold text-white">Recent Products</h3>
            <Link to="/admin/products" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
              View all →
            </Link>
          </div>
          {prodLoading ? (
            <div className="p-8"><LoadingSpinner /></div>
          ) : recent.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              <p className="mb-3">No products yet.</p>
              <Link to="/admin/products/new" className="admin-btn py-2 px-4 text-sm">Add First Product</Link>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {recent.map((p) => (
                <div key={p._id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-white/[0.05] flex-shrink-0 flex items-center justify-center">
                    {p.image ? (
                      <img src={`${SERVER_URL}${p.image}`} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate text-sm">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.category}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-medium border ${p.visible ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>
                    {p.visible ? "Visible" : "Hidden"}
                  </span>
                  <Link to={`/admin/products/${p._id}/edit`} className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors flex-shrink-0">
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Category Breakdown */}
          {!statsLoading && stats?.categoryStats && stats.categoryStats.length > 0 && (
            <motion.div
              className="admin-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="font-semibold text-white mb-4">Categories</h3>
              <div className="space-y-3">
                {stats.categoryStats.map((cat) => (
                  <div key={cat.name}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-400 truncate mr-2 text-xs">{cat.name}</span>
                      <span className="text-white font-medium text-xs flex-shrink-0">{cat.count}</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(cat.count / maxCat) * 100}%` }}
                        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            className="admin-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-1">
              {QUICK_ACTIONS.map((a) => (
                <Link
                  key={a.label}
                  to={a.to}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all group"
                >
                  <span className="text-slate-500 group-hover:text-emerald-400 transition-colors flex-shrink-0">{a.icon}</span>
                  {a.label}
                  <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Bookings — spans 3 cols */}
        <div className="lg:col-span-3 admin-card overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="font-semibold text-white">Recent Bookings</h3>
            <Link to="/admin/bookings" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
              View all →
            </Link>
          </div>
          {bookingsLoading ? (
            <div className="p-8"><LoadingSpinner /></div>
          ) : recentBookings.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="mb-3">No bookings yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {recentBookings.map((b) => (
                <div key={b._id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-emerald-500/10 text-emerald-400 flex flex-shrink-0 items-center justify-center font-bold">
                    {b.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate text-sm">{b.name} <span className="text-slate-500 font-normal">({b.phone})</span></p>
                    <p className="text-xs text-emerald-400 truncate mt-0.5">{b.productName}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                      b.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                      b.status === "confirmed" ? "bg-emerald-500/20 text-emerald-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                    {b.status}
                  </span>
                  <Link to={`/admin/bookings`} className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors flex-shrink-0">
                    Manage
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
