import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchSiteSettings } from "../../api/settings";
import Logo from "../ui/Logo";


const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: fetchSiteSettings,
    staleTime: 60000,
  });
  const phone = settings?.phone || "+91-98765-43210";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => setOpen(false), [location]);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur-sm shadow-sm"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo size="md" dark={false} />
          </Link>


          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === to ? "bg-primary-100 text-brand-green" : "text-gray-600 hover:text-brand-green hover:bg-primary-50"
                }`}>
                {label}
              </Link>
            ))}
          </div>

          {/* CTA + Admin link */}
          <div className="hidden md:flex items-center gap-3">
            <a href={`tel:${phone}`} className="btn-primary py-2 px-4 text-sm">📞 {phone}</a>
          </div>

          {/* Hamburger */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100">
            <div className={`w-5 h-0.5 bg-current mb-1 transition-all ${open ? "rotate-45 translate-y-1.5" : ""}`} />
            <div className={`w-5 h-0.5 bg-current mb-1 transition-all ${open ? "opacity-0" : ""}`} />
            <div className={`w-5 h-0.5 bg-current transition-all ${open ? "-rotate-45 -translate-y-1.5" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map(({ to, label }) => (
                <Link key={to} to={to}
                  className={`block px-4 py-3 rounded-lg font-medium ${location.pathname === to ? "bg-primary-100 text-brand-green" : "text-gray-700 hover:bg-gray-50"}`}>
                  {label}
                </Link>
              ))}
              <a href={`tel:${phone}`} className="btn-primary w-full justify-center mt-2">📞 Call to Order</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
