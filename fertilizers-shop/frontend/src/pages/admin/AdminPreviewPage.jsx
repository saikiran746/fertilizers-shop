import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";

const PAGES = [
  { label: "Home", path: "/" },
  { label: "Products", path: "/products" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

const VIEWPORTS = [
  {
    id: "desktop",
    label: "Desktop",
    width: "100%",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "tablet",
    label: "Tablet",
    width: "768px",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "mobile",
    label: "Mobile",
    width: "390px",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
];

const BASE = window.location.origin;

export default function AdminPreviewPage() {
  const [activePath, setActivePath] = useState("/");
  const [viewport, setViewport] = useState("desktop");
  const [isLoading, setIsLoading] = useState(true);
  const [urlInput, setUrlInput] = useState("/");
  const iframeRef = useRef(null);
  const [key, setKey] = useState(0); // force iframe reload

  const currentViewport = VIEWPORTS.find((v) => v.id === viewport);

  const navigate = useCallback((path) => {
    setActivePath(path);
    setUrlInput(path);
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = BASE + path;
    }
  }, []);

  const refresh = () => {
    setIsLoading(true);
    setKey((k) => k + 1);
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    navigate(urlInput.startsWith("/") ? urlInput : "/" + urlInput);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-112px)]">
      {/* ── Header Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div>
          <h2 className="text-3xl font-heading font-extrabold text-white tracking-tight">Website Preview</h2>
          <p className="text-slate-400 text-sm">View your live website without leaving the admin panel</p>
        </div>

        {/* Viewport switcher */}
        <div className="sm:ml-auto flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
          {VIEWPORTS.map((v) => (
            <button
              key={v.id}
              onClick={() => setViewport(v.id)}
              title={v.label}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewport === v.id
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {v.icon}
              <span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Browser Chrome ── */}
      <motion.div
        className="flex-1 admin-card overflow-hidden flex flex-col"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Browser top bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-[#1a2435] border-b border-white/[0.06] flex-shrink-0">
          {/* Traffic lights */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
          </div>

          {/* Page nav pills */}
          <div className="flex gap-1 ml-2">
            {PAGES.map((p) => (
              <button
                key={p.path}
                onClick={() => navigate(p.path)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activePath === p.path
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* URL bar */}
          <form onSubmit={handleUrlSubmit} className="flex-1 mx-2">
            <div className="flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-1.5">
              {/* Lock icon */}
              <svg className="w-3 h-3 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-slate-500 text-xs">{BASE}</span>
              <input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 bg-transparent text-slate-300 text-xs outline-none min-w-0"
                placeholder="/"
              />
            </div>
          </form>

          {/* Refresh + open in new tab */}
          <div className="flex gap-1">
            <button
              onClick={refresh}
              title="Refresh"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-all"
            >
              <svg className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <a
              href={BASE + activePath}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in new tab"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Iframe container */}
        <div className="flex-1 overflow-auto bg-[#0d1525] flex justify-center">
          <div
            className="relative transition-all duration-500 h-full"
            style={{ width: currentViewport.width, minWidth: viewport !== "desktop" ? currentViewport.width : undefined }}
          >
            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-[#0B1120] flex flex-col items-center justify-center z-10">
                <div className="relative w-12 h-12 mb-4">
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-t-emerald-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  </div>
                </div>
                <p className="text-slate-400 text-sm">Loading website preview…</p>
                <p className="text-slate-600 text-xs mt-1">{BASE + activePath}</p>
              </div>
            )}

            <iframe
              key={key}
              ref={iframeRef}
              src={BASE + activePath}
              title="Website Preview"
              className="w-full h-full border-0"
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
              style={{ minHeight: "600px" }}
            />
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#1a2435] border-t border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLoading ? "bg-amber-400 animate-pulse" : "bg-emerald-500"}`} />
            <span className="text-slate-500 text-xs">{isLoading ? "Loading…" : "Ready"}</span>
          </div>
          <span className="text-slate-600 text-xs">
            {currentViewport.label} {viewport !== "desktop" && `· ${currentViewport.width}`}
          </span>
          <span className="text-slate-600 text-xs">AgroPlus · {BASE + activePath}</span>
        </div>
      </motion.div>
    </div>
  );
}
