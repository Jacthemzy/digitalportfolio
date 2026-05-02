"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  if (isAdmin) return null;

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 inset-x-0 z-50 h-[64px] flex items-center justify-between px-8 transition-all duration-500 ${
          scrolled ? "bg-[#04040a]/95 backdrop-blur-2xl border-b border-[#1a1a30]" : "bg-transparent"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative w-9 h-9 border border-[#e8c547] flex items-center justify-center overflow-hidden"
          >
            <span className="font-display font-bold text-[#e8c547] text-sm relative z-10 group-hover:text-[#04040a] transition-colors duration-300">
              TJ
            </span>
            <div className="absolute inset-0 bg-[#e8c547] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </motion.div>
          <div className="hidden sm:block">
            <span className="font-display text-[#eeeef5] text-lg leading-none block">
              Temidayo Jacob
            </span>
            <span className="font-mono text-[8px] text-[#3a3a5c] tracking-widest uppercase">
              PM · Marketer · Developer
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden xl:flex items-center gap-0.5">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="relative px-3 py-2 group">
              {pathname === l.href && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-[#e8c547]/10 border border-[#e8c547]/25 rounded-sm"
                />
              )}
              <span
                className={`relative font-mono text-[9px] uppercase tracking-widest transition-colors duration-200 ${
                  pathname === l.href ? "text-[#e8c547]" : "text-[#7878a0] group-hover:text-[#eeeef5]"
                }`}
              >
                {l.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Available badge + CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 border border-[rgba(37,211,102,0.3)] bg-[rgba(37,211,102,0.06)]">
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#25d366]"
              style={{ animation: "availBlink 2s ease-in-out infinite" }}
            />
            <span className="font-mono text-[9px] text-[#25d366] uppercase tracking-widest">
              Available for hire
            </span>
          </div>
          <Link
            href="/chat"
            className="flex items-center gap-2 px-4 py-2 bg-[#e8c547] text-[#04040a] font-bold text-[11px] hover:bg-[#f5e070] transition-all"
          >
            Hire Me →
          </Link>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="xl:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
          aria-label="Menu"
        >
          <motion.span animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} className="block w-5 h-px bg-[#eeeef5] origin-center" />
          <motion.span animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }} className="block w-5 h-px bg-[#eeeef5]" />
          <motion.span animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} className="block w-5 h-px bg-[#eeeef5] origin-center" />
        </button>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-[#04040a]/98 backdrop-blur-2xl xl:hidden flex flex-col items-center justify-center gap-8"
          >
            {links.map((l, i) => (
              <motion.div
                key={l.href}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.05 }}
              >
                <Link
                  href={l.href}
                  className={`font-display text-4xl font-light transition-colors ${
                    pathname === l.href ? "text-[#e8c547]" : "text-[#eeeef5] hover:text-[#e8c547]"
                  }`}
                >
                  {l.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
