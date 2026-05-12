"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useMotionTemplate, useMotionValue, animate } from "framer-motion";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/skills", label: "Skills" },
  { href: "/projects", label: "Projects" },
  { href: "/product-thinking", label: "Thinking" },
  { href: "/social-impact", label: "Impact" },
  { href: "/cv", label: "CV" },
  { href: "/chat", label: "Chat" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [site, setSite] = useState({
    displayName: "Temidayo Jacob",
    tagline: "PM · Marketer · Developer",
    available: true,
    availableLong: "Available for hire",
    availableShort: "Open",
  });
  const navRef = useRef<HTMLElement>(null);
  const isAdmin = pathname.startsWith("/admin");

  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${mx}% ${my}%, rgba(232,197,71,0.14), transparent 55%)`;

  const onNavMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!navRef.current || reduceMotion) return;
      const r = navRef.current.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      animate(mx, x, { duration: 0.35, ease: [0.22, 1, 0.36, 1] });
      animate(my, y, { duration: 0.35, ease: [0.22, 1, 0.36, 1] });
    },
    [mx, my, reduceMotion]
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const fn = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/site-content?section=settings", { signal: ac.signal })
      .then((r) => r.json())
      .then((payload: { data?: Record<string, unknown> }) => {
        const d = payload.data || {};
        const name = String(d.siteName || d.siteTitle || "Temidayo Jacob").trim();
        const rawTag = String(d.siteTagline || "PM · Marketer · Developer").trim();
        const tagline = rawTag.length > 48 ? `${rawTag.slice(0, 46)}…` : rawTag;
        const available = d.isAvailable !== false && d.availableForHire !== false;
        const longText = String(d.availableText || "Available for hire").trim();
        const short =
          longText.length > 14 ? `${longText.split(/\s+/).slice(0, 2).join(" ")}…` : longText || "Open";
        setSite({
          displayName: name,
          tagline,
          available: !!available,
          availableLong: longText,
          availableShort: short,
        });
      })
      .catch(() => {});
    return () => ac.abort();
  }, []);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24);
        frame = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (isAdmin) return null;

  return (
    <>
      {/* ── Desktop / tablet: floating instrument dock ── */}
      <motion.header
        ref={navRef}
        onPointerMove={onNavMove}
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 inset-x-0 z-50 hidden md:block pointer-events-none"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-4 sm:pt-5 pointer-events-auto">
          <div
            className={[
              "relative overflow-hidden rounded-[999px] border transition-[box-shadow,border-color,background-color] duration-500",
              scrolled
                ? "border-white/[0.12] bg-[#05050c]/78 shadow-[0_18px_60px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl"
                : "border-white/[0.06] bg-[#05050c]/35 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl",
            ].join(" ")}
          >
            {!reduceMotion && (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-90"
                style={{ background: spotlight }}
              />
            )}
            {/* Top spectral hairline */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#e8c547]/55 to-transparent opacity-80"
            />
            <div className="relative flex items-center gap-2 sm:gap-3 pl-3 sm:pl-4 pr-2 py-2 sm:py-2.5">
              {/* Mark */}
              <Link href="/" className="group flex shrink-0 items-center gap-2.5 sm:gap-3 pr-1">
                <div className="relative grid h-10 w-10 place-items-center">
                  <svg viewBox="0 0 40 40" className="h-10 w-10 text-[#e8c547]/35" aria-hidden>
                    <rect x="1" y="1" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1" />
                    <path d="M1 12h10M29 1v10M39 28h-10M12 39V29" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-[#e8c547]" />
                  </svg>
                  <span className="absolute font-mono text-[11px] font-semibold tracking-tight text-[#eeeef5]">TJ</span>
                  {!reduceMotion && (
                    <motion.span
                      className="pointer-events-none absolute inset-0 rounded-sm border border-[#e8c547]/20"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </div>
                <div className="hidden min-[900px]:block leading-tight">
                  <span className="font-display text-base tracking-tight text-[#eeeef5]">{site.displayName}</span>
                  <span className="mt-0.5 block font-mono text-[7px] uppercase tracking-[0.28em] text-[#3a3a5c]">
                    {site.tagline}
                  </span>
                </div>
              </Link>

              <div className="mx-1 h-8 w-px shrink-0 bg-gradient-to-b from-transparent via-[#1a1a30] to-transparent min-[900px]:mx-2" />

              {/* Links */}
              <nav className="flex min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto no-scrollbar px-1 py-0.5">
                {links.map((l, i) => {
                  const active = pathname === l.href;
                  const idx = String(i + 1).padStart(2, "0");
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      title={l.label}
                      className="group relative shrink-0 px-2 py-2 min-[1024px]:px-2.5"
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-active-pulse"
                          className="absolute inset-0 rounded-full bg-[#e8c547]/[0.09] ring-1 ring-[#e8c547]/25"
                          transition={{ type: "spring", stiffness: 380, damping: 34 }}
                        />
                      )}
                      <span className="relative flex flex-col items-center gap-1">
                        <span
                          className={`font-mono text-[7px] uppercase tracking-[0.2em] transition-colors ${
                            active ? "text-[#e8c547]" : "text-[#3a3a5c] group-hover:text-[#7878a0]"
                          }`}
                        >
                          {idx}
                        </span>
                        <span
                          className={`whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.14em] transition-colors min-[1024px]:text-[9px] ${
                            active ? "text-[#eeeef5]" : "text-[#7878a0] group-hover:text-[#eeeef5]"
                          }`}
                        >
                          {l.label}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mx-0.5 h-8 w-px shrink-0 bg-gradient-to-b from-transparent via-[#1a1a30] to-transparent min-[900px]:mx-1" />

              {/* Status + CTA */}
              <div className="flex shrink-0 items-center gap-2">
                <div
                  className={`hidden lg:flex items-center gap-2 rounded-full border px-3 py-1.5 ${
                    site.available
                      ? "border-[#25d366]/25 bg-[#25d366]/[0.06]"
                      : "border-[#7878a0]/25 bg-[#7878a0]/[0.06]"
                  }`}
                >
                  <span className="relative flex h-2 w-2">
                    {site.available ? (
                      <>
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25d366] opacity-40" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#25d366]" />
                      </>
                    ) : (
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#7878a0]" />
                    )}
                  </span>
                  <span
                    className={`hidden min-[1100px]:inline font-mono text-[8px] uppercase tracking-[0.14em] ${
                      site.available ? "text-[#25d366]/95" : "text-[#7878a0]"
                    }`}
                  >
                    {site.availableLong}
                  </span>
                  <span
                    className={`min-[1100px]:hidden font-mono text-[8px] uppercase tracking-[0.18em] ${
                      site.available ? "text-[#25d366]/95" : "text-[#7878a0]"
                    }`}
                  >
                    {site.available ? site.availableShort : "Away"}
                  </span>
                </div>
                <Link
                  href="/chat"
                  className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-[#e8c547] px-3.5 py-2 text-[#04040a] min-[900px]:px-4"
                >
                  <span className="relative z-10 font-mono text-[9px] font-bold uppercase tracking-[0.12em]">Hire</span>
                  <motion.span
                    className="relative z-10 inline-block text-xs"
                    whileHover={{ x: 3 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  >
                    →
                  </motion.span>
                  <span className="absolute inset-0 translate-y-full bg-[#f5e070] transition-transform duration-300 group-hover:translate-y-0" />
                </Link>
              </div>
            </div>

            {/* Micro meter — route rhythm */}
            <div className="relative flex h-3 items-end justify-center gap-[3px] px-10 pb-2 pt-0.5">
              {links.map((l, i) => {
                const active = pathname === l.href;
                return (
                  <motion.div
                    key={l.href}
                    className={`w-[3px] rounded-full ${active ? "bg-[#e8c547]" : "bg-[#1a1a30]"}`}
                    initial={false}
                    animate={{
                      height: active ? 12 : 4,
                      opacity: active ? 1 : 0.55,
                    }}
                    transition={{ type: "spring", stiffness: 420, damping: 28 }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </motion.header>

      {/* ── Mobile: minimal rail + ring trigger + bento overlay ── */}
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 inset-x-0 z-50 md:hidden"
      >
        <div
          className={[
            "mx-3 mt-3 flex h-14 items-center justify-between rounded-2xl border px-3 transition-all duration-500",
            scrolled
              ? "border-white/[0.12] bg-[#05050c]/88 shadow-[0_16px_48px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
              : "border-white/[0.07] bg-[#05050c]/55 backdrop-blur-xl",
          ].join(" ")}
        >
          <Link href="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-[#e8c547]/35 bg-[#e8c547]/[0.06]">
              <span className="font-mono text-[10px] font-semibold text-[#e8c547]">TJ</span>
            </div>
            <div className="leading-tight">
              <span className="block font-display text-sm text-[#eeeef5]">
                {site.displayName.split(/\s+/)[0] || "Temidayo"}
              </span>
              <span className="font-mono text-[6px] uppercase tracking-[0.22em] text-[#3a3a5c]">Portfolio</span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/chat"
              className="rounded-full bg-[#e8c547]/90 px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-wider text-[#04040a]"
            >
              Hire
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="relative grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-[#04040a]/40"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              <span className="absolute inset-[3px] rounded-full border border-white/15" />
              <motion.span
                className="absolute inset-[6px] rounded-full border-2 border-transparent border-t-[#e8c547]/80"
                animate={open ? { rotate: 360 } : { rotate: 0 }}
                transition={open ? { duration: 2.2, repeat: Infinity, ease: "linear" } : { duration: 0.2 }}
              />
              <span className="relative font-mono text-[10px] text-[#eeeef5]">{open ? "×" : "≡"}</span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55] bg-[#020208]/80 backdrop-blur-sm md:hidden"
              aria-label="Close menu backdrop"
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="fixed inset-x-3 bottom-[max(1rem,env(safe-area-inset-bottom))] top-[5.5rem] z-[60] flex flex-col overflow-hidden rounded-[1.35rem] border border-white/[0.1] bg-[#05050c]/95 shadow-[0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl md:hidden"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(232,197,71,0.12),transparent_50%)]" />
              <div className="relative flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-[#3a3a5c]">Navigate</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-white/10 px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-[#7878a0] hover:border-[#e8c547]/30 hover:text-[#e8c547]"
                >
                  Close
                </button>
              </div>
              <div className="relative grid flex-1 grid-cols-2 gap-px bg-[#1a1a30]/80 p-px content-start overflow-y-auto">
                {links.map((l, i) => {
                  const active = pathname === l.href;
                  const idx = String(i + 1).padStart(2, "0");
                  const spanChat = l.href === "/chat";
                  return (
                    <motion.div
                      key={l.href}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04 + i * 0.035, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className={spanChat ? "col-span-2" : ""}
                    >
                      <Link
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className={[
                          "relative flex h-full min-h-[4.5rem] flex-col justify-between overflow-hidden bg-[#07070f] p-4 transition-colors active:bg-[#0c0c18]",
                          active ? "ring-1 ring-inset ring-[#e8c547]/35" : "hover:bg-[#0a0a14]",
                        ].join(" ")}
                      >
                        <span className="font-mono text-[28px] font-light leading-none text-[#1a1a30]">{idx}</span>
                        <span
                          className={`font-display text-xl font-light tracking-tight ${
                            active ? "text-[#e8c547]" : "text-[#eeeef5]"
                          }`}
                        >
                          {l.label}
                        </span>
                        <span className="absolute right-3 top-3 font-mono text-[10px] text-[#3a3a5c]">↗</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer so content clears fixed nav */}
      <div className="h-[4.5rem] md:h-[7.25rem]" aria-hidden />
    </>
  );
}
