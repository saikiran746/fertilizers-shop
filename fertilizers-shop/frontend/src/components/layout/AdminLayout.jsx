import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { adminGetUnreadBadges } from "../../api/settings";
import { useAuth } from "../../store/AuthContext";
import Logo from "../ui/Logo";
import toast from "react-hot-toast";
import Logo from "../ui/Logo";

const NAV = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
      </svg>
    ),
  },
  {
    to: "/admin/products",
    label: "Products",
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    to: "/admin/products/new",
    label: "Add Product",
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    to: "/admin/notifications",
    label: "Notifications",
    badgeKey: "unreadMessages",
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    to: "/admin/bookings",
    label: "Bookings",
    badgeKey: "unreadBookings",
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    to: "/admin/settings",
    label: "Settings",
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    to: "/admin/preview",
    label: "View Website",
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
];

function getPageTitle(pathname) {
  if (pathname.includes("products/new")) return "Add Product";
  if (pathname.includes("/edit")) return "Edit Product";
  if (pathname.endsWith("/products")) return "Products";
  if (pathname.includes("settings")) return "Settings";
  if (pathname.includes("dashboard")) return "Dashboard";
  if (pathname.includes("notifications")) return "Notifications";
  if (pathname.includes("bookings")) return "Bookings";
  if (pathname.includes("preview")) return "Website Preview";
  return "Admin";
}

export default function AdminLayout({ children }) {
  // collapsed = icon-only desktop mode; mobileOpen = slide-in on mobile
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { username, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const [prevCounts, setPrevCounts] = useState({ unreadMessages: 0, unreadBookings: 0 });

  const { data: badgeData } = useQuery({
    queryKey: ["admin-unread-badges"],
    queryFn: adminGetUnreadBadges,
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (badgeData) {
      if (badgeData.unreadMessages > prevCounts.unreadMessages) {
        toast("You have new notifications!", { icon: "🔔", style: { background: '#1e293b', color: '#fff' } });
      }
      if (badgeData.unreadBookings > prevCounts.unreadBookings) {
        toast("You have new bookings!", { icon: "🛒", style: { background: '#1e293b', color: '#fff' } });
      }
      setPrevCounts({
        unreadMessages: badgeData.unreadMessages,
        unreadBookings: badgeData.unreadBookings
      });
    }
  }, [badgeData]);

  const handleLogout = () => { logout(); navigate("/admin/login"); };
  const initials = (username || "A").charAt(0).toUpperCase();

  const SIDEBAR_WIDE = 260;
  const SIDEBAR_NARROW = 72;

  const sidebarContent = (isCollapsed) => (
    <>
      {/* ── Logo / Toggle row ── */}
      <div
        className={`flex items-center border-b border-white/[0.07] flex-shrink-0 transition-all duration-300 ${
          isCollapsed ? "justify-center px-3 py-5" : "justify-between px-5 py-5"
        }`}
      >
        {!isCollapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
            <Logo size="md" dark={true} />
          </motion.div>
        )}
        {/* Toggle button — desktop only */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden md:flex w-8 h-8 items-center justify-center rounded-xl bg-white/[0.06] hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-400 transition-all duration-200 flex-shrink-0"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            {isCollapsed
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />}
          </svg>
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className={`flex-1 py-4 overflow-y-auto overflow-x-hidden space-y-1 ${isCollapsed ? "px-2" : "px-3"}`}
        style={{ scrollbarWidth: "none" }}>
        {NAV.map(({ to, icon, label, badgeKey }) => {
          const badgeCount = badgeKey && badgeData ? badgeData[badgeKey] : 0;
          return (
          <NavLink
            key={to}
            to={to}
            end={to === "/admin/dashboard"}
            className={({ isActive }) =>
              `group relative flex items-center rounded-xl font-medium transition-all duration-200 ${
                isCollapsed ? "justify-center w-full px-0 py-3" : "gap-3.5 px-3.5 py-3"
              } ${
                isActive
                  ? "bg-gradient-to-r from-emerald-500/20 to-green-500/10 text-emerald-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active left bar */}
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 bg-gradient-to-b from-emerald-400 to-green-500 rounded-r-full"
                    layoutId="activeNavBar"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}

                {/* Icon with tooltip on collapsed */}
                <span
                  className={`flex-shrink-0 transition-colors duration-200 ${isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-200"}`}
                  title={isCollapsed ? label : undefined}
                >
                  {icon}
                </span>

                {/* Label */}
                {!isCollapsed && (
                  <span className="flex-1 text-[15px] truncate">{label}</span>
                )}

                {/* Badge */}
                {badgeKey && badgeCount > 0 && !isCollapsed && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white min-w-[18px] text-center animate-pulse">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
                {badgeKey && badgeCount > 0 && isCollapsed && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                )}

                {/* Tooltip when collapsed */}
                {isCollapsed && (
                  <span className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-xl border border-white/10">
                    {label}
                    <span className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-2 h-2 bg-gray-900 border-l border-b border-white/10 rotate-45" />
                  </span>
                )}
              </>
            )}
          </NavLink>
        )})}
      </nav>

      {/* ── User Section ── */}
      <div className={`border-t border-white/[0.07] flex-shrink-0 ${isCollapsed ? "p-2" : "p-4"}`}>
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold shadow-lg cursor-default"
              title={username || "Admin"}
            >
              {initials}
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="w-10 h-10 flex items-center justify-center rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 px-1 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{username || "Admin"}</p>
                <p className="text-slate-500 text-xs">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-admin-bg admin-scroll">

      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-20 md:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Mobile Sidebar (always full-width) ── */}
      <motion.aside
        className="fixed inset-y-0 left-0 z-30 md:hidden flex flex-col"
        style={{
          width: SIDEBAR_WIDE,
          background: "linear-gradient(180deg, #0f1923 0%, #0a1118 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
        initial={{ x: -SIDEBAR_WIDE }}
        animate={{ x: mobileOpen ? 0 : -SIDEBAR_WIDE }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
      >
        {sidebarContent(false)}
      </motion.aside>

      {/* ── Desktop Sidebar (collapsible) ── */}
      <motion.aside
        className="hidden md:flex flex-col sticky top-0 h-screen flex-shrink-0 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #0f1923 0%, #0a1118 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
        animate={{ width: collapsed ? SIDEBAR_NARROW : SIDEBAR_WIDE }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
      >
        {sidebarContent(collapsed)}
      </motion.aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-admin-bg/90 backdrop-blur-xl border-b border-white/[0.06] px-6 py-4 flex items-center gap-4">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1">
            <h1 className="text-white font-bold text-xl tracking-tight">{getPageTitle(location.pathname)}</h1>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-xs font-semibold">Online</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
