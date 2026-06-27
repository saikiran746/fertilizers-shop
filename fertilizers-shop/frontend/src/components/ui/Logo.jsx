/**
 * AgroPlus brand logo component.
 * Props:
 *   size   — "sm" | "md" | "lg"  (default "md")
 *   dark   — true for white text (admin/dark bg), false for gradient text (light bg)
 *   iconOnly — show only the icon mark
 */
export default function Logo({ size = "md", dark = false, iconOnly = false }) {
  const sizes = {
    sm: { wrap: "gap-2", icon: "w-8 h-8 rounded-xl", svg: "w-4 h-4", name: "text-base", sub: "text-[9px]" },
    md: { wrap: "gap-2.5", icon: "w-10 h-10 rounded-xl", svg: "w-5 h-5", name: "text-xl", sub: "text-[10px]" },
    lg: { wrap: "gap-3", icon: "w-14 h-14 rounded-2xl", svg: "w-7 h-7", name: "text-3xl", sub: "text-xs" },
  };
  const s = sizes[size];

  return (
    <div className={`flex items-center ${s.wrap}`}>
      {/* Icon mark — stylized "A" inside a leaf shield */}
      <div
        className={`${s.icon} flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-lg`}
        style={{
          background: "linear-gradient(135deg, #059669 0%, #16a34a 50%, #15803d 100%)",
          boxShadow: "0 4px 16px rgba(5,150,105,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
      >
        {/* Leaf background decoration */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20"
          viewBox="0 0 40 40"
          fill="none"
        >
          <path d="M20 4 C11 4 5 13 6 22 C7 30 14 36 20 36 C26 36 33 30 34 22 C35 13 29 4 20 4Z" fill="white" />
        </svg>
        {/* Bold "A" lettermark */}
        <svg className={s.svg} viewBox="0 0 24 24" fill="none">
          <path d="M12 3L3 21h18L12 3z" fill="none" stroke="white" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M7 15h10" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          {/* Tiny leaf on top of A */}
          <path d="M12 3 C11 1.5 9.5 1 9.5 1 C9.5 1 11.5 1.5 12 3Z" fill="white" fillOpacity="0.7" />
        </svg>
      </div>

      {/* Text */}
      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-extrabold tracking-tight font-heading ${s.name}`}
            style={
              dark
                ? { color: "white" }
                : {
                    background: "linear-gradient(135deg, #059669, #16a34a)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }
            }
          >
            AgroPlus
          </span>
          <span className={`${s.sub} tracking-widest uppercase font-medium ${dark ? "text-emerald-400/70" : "text-emerald-700/60"}`}>
            Fertilizers
          </span>
        </div>
      )}
    </div>
  );
}
