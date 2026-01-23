"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

/**
 * Lumaire Studio — “million-dollar” landing page
 * - Cinematic hero entrance + kinetic type
 * - Ambient spotlight cursor + paper grain + vignette + slow light sweep
 * - Signature flourish (SVG path draw)
 * - Magnetic CTA + underline-draw links
 * - System Status card with pulsing dot, 3D tilt, expandable “peek”, progress bar
 * - Scroll reveal sections, sticky manifesto column
 * - “Wow moment” screenshot stack parallax (placeholder cards)
 * - Elegant FAQ accordion
 * - Optional ultra-subtle sound toggle (off by default)
 *
 * Assumes Tailwind + your custom palette classes exist:
 * text-lumaire-wine, text-lumaire-brown, border-lumaire-tan, bg-lumaire-cream, etc.
 */

const EASE_LUX = [0.16, 1, 0.3, 1] as const;

function cn(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(" ");
}

function useSpotlight() {
  // Updates CSS vars for cursor spotlight
  useEffect(() => {
    const root = document.documentElement;

    const onMove = (e: MouseEvent) => {
      root.style.setProperty("--mx", `${e.clientX}px`);
      root.style.setProperty("--my", `${e.clientY}px`);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
}

function useSoftSound() {
  const [enabled, setEnabled] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  const ensureCtx = async () => {
    if (typeof window === "undefined") return null;
    const AudioCtx = (window.AudioContext ||
      (window as any).webkitAudioContext) as typeof AudioContext | undefined;
    if (!AudioCtx) return null;

    if (!ctxRef.current) ctxRef.current = new AudioCtx();
    if (ctxRef.current.state === "suspended") {
      try {
        await ctxRef.current.resume();
      } catch {}
    }
    return ctxRef.current;
  };

  const playPaperTick = async () => {
    if (!enabled) return;
    const ctx = await ensureCtx();
    if (!ctx) return;

    // tiny “paper-ish” noise tick (very subtle)
    const duration = 0.028;
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
    const data = buffer.getChannelData(0);

    // filtered noise envelope
    for (let i = 0; i < data.length; i++) {
      const t = i / data.length;
      const env = Math.pow(1 - t, 3);
      data[i] = (Math.random() * 2 - 1) * env;
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 1400;

    const gain = ctx.createGain();
    gain.gain.value = 0.02; // very low volume

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    src.start();
  };

  return { enabled, setEnabled, playPaperTick };
}

function Reveal({
  children,
  delay = 0,
  y = 12,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 1 } : { opacity: 0, y, filter: "blur(6px)" }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.9, ease: EASE_LUX, delay }}
    >
      {children}
    </motion.div>
  );
}

function UnderlineLink({
  href,
  children,
  onHoverSound,
  className,
}: {
  href: string;
  children: React.ReactNode;
  onHoverSound?: () => void;
  className?: string;
}) {
  return (
    <a
      href={href}
      onMouseEnter={onHoverSound}
      className={cn(
        "group relative inline-flex items-center text-sm uppercase tracking-[0.18em] text-lumaire-brown/70 hover:text-lumaire-brown transition-colors",
        className
      )}
    >
      <span>{children}</span>
      <span
        className="pointer-events-none absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-lumaire-brown/50 transition-transform duration-700 group-hover:scale-x-100"
        aria-hidden
      />
    </a>
  );
}

function MagneticButton({
  children,
  className,
  onClick,
  onHoverSound,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onHoverSound?: () => void;
  href?: string;
}) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null);
  const reduce = useReducedMotion();

  const onMove = (e: React.MouseEvent) => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    const tx = (x / rect.width) * 10; // subtle
    const ty = (y / rect.height) * 10;
    (el as any).style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    (el as any).style.transform = `translate3d(0px, 0px, 0)`;
  };

  const shared =
    "inline-flex items-center justify-center select-none rounded-sm border border-lumaire-tan px-6 py-3 text-sm uppercase tracking-[0.18em] transition-shadow duration-500 will-change-transform";

  if (href) {
    return (
      <a
        ref={(n) => (ref.current = n)}
        href={href}
        onMouseEnter={onHoverSound}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className={cn(
          shared,
          "bg-transparent text-lumaire-brown hover:shadow-[0_18px_55px_rgba(0,0,0,0.12)]",
          className
        )}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={(n) => (ref.current = n)}
      onClick={onClick}
      onMouseEnter={onHoverSound}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        shared,
        "bg-transparent text-lumaire-brown hover:shadow-[0_18px_55px_rgba(0,0,0,0.12)]",
        className
      )}
      type="button"
    >
      {children}
    </button>
  );
}

function TiltCard({
  children,
  className,
  onHoverSound,
}: {
  children: React.ReactNode;
  className?: string;
  onHoverSound?: () => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();

  const onMove = (e: React.MouseEvent) => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const rotY = (px - 0.5) * 6; // subtle tilt
    const rotX = -(py - 0.5) * 6;

    el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(0)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg)`;
  };

  return (
    <div
      ref={ref}
      onMouseEnter={onHoverSound}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        "transition-transform duration-300 will-change-transform",
        className
      )}
    >
      {children}
    </div>
  );
}

function Accordion({
  items,
}: {
  items: Array<{ q: string; a: string }>;
}) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-lumaire-tan/60 border border-lumaire-tan rounded-sm">
      {items.map((it, idx) => {
        const isOpen = open === idx;
        return (
          <div key={it.q} className="bg-white/40">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : idx)}
              className="w-full text-left px-6 py-5 flex items-center justify-between gap-6"
            >
              <span className="font-serif text-lg text-lumaire-brown">
                {it.q}
              </span>
              <span className="text-lumaire-brown/60">
                {isOpen ? "—" : "+"}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.6, ease: EASE_LUX }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 text-lumaire-brown/80 leading-relaxed">
                    {it.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function SignatureFlourish() {
  // A simple stroke-draw flourish under the logo
  const reduce = useReducedMotion();
  return (
    <motion.svg
      width="260"
      height="28"
      viewBox="0 0 260 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto mt-5 opacity-70"
      aria-hidden
    >
      <motion.path
        d="M6 18 C 40 6, 70 26, 105 16 C 140 6, 170 24, 205 14 C 225 8, 240 10, 254 14"
        stroke="currentColor"
        className="text-lumaire-brown/50"
        strokeWidth="1.2"
        strokeLinecap="round"
        initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.6, ease: EASE_LUX, delay: 0.6 }}
      />
    </motion.svg>
  );
}

function ScrollHint() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="mt-12 flex flex-col items-center gap-3"
      initial={reduce ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.0, ease: EASE_LUX, delay: 1.15 }}
    >
      <div className="text-xs uppercase tracking-[0.22em] text-lumaire-brown/50">
        Explore
      </div>
      <motion.div
        className="h-8 w-px bg-lumaire-brown/40"
        animate={reduce ? {} : { opacity: [0.4, 0.9, 0.4], scaleY: [0.85, 1, 0.85] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: EASE_LUX }}
        aria-hidden
      />
    </motion.div>
  );
}

export default function Home() {
  useSpotlight();
  const reduce = useReducedMotion();
  const sound = useSoftSound();

  const [statusOpen, setStatusOpen] = useState(false);

  const features = useMemo(
    () => [
      {
        title: "Timeline Engine",
        desc: "From first call to final send-off — every moment stays aligned, visible, and calm.",
      },
      {
        title: "Vendor CRM",
        desc: "Your entire vendor world — contracts, notes, and relationships — in one quiet place.",
      },
      {
        title: "Client Portal",
        desc: "A refined experience for clients that reduces chaos and increases trust.",
      },
    ],
    []
  );

  const benefits = useMemo(
    () => [
      { k: "Time", v: "Less manual chasing. More presence." },
      { k: "Clarity", v: "Every task is where it should be." },
      { k: "Control", v: "A system that holds the weight with you." },
    ],
    []
  );

  const faq = useMemo(
    () => [
      {
        q: "Is Lumaire built for luxury planners only?",
        a: "It’s designed for planners who value calm, polish, and structure. Whether you serve intimate weddings or large-scale events, the system scales with your process.",
      },
      {
        q: "What makes it different from generic planning tools?",
        a: "Lumaire focuses on flow: timelines, vendor relationships, and client experience — with less noise. It’s built to feel like a studio, not a spreadsheet.",
      },
      {
        q: "Can I migrate from my current workflow?",
        a: "Yes — the onboarding is designed to map your existing process into Lumaire without losing history or momentum.",
      },
      {
        q: "Is it privacy-first?",
        a: "Yes. No ads, no selling data, and a product philosophy that treats client trust as sacred.",
      },
    ],
    []
  );

  // Parallax for the “preview stack” wow section
  const wowRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: wowRef,
    offset: ["start end", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [18, -18]);
  const y2 = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [28, -28]);
  const y3 = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [38, -38]);

  return (
    <main
      className={cn(
        "relative min-h-screen overflow-x-hidden",
        "bg-lumaire-cream text-center"
      )}
    >
      {/* Ambient layers: spotlight + vignette + grain + sweep */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Cursor spotlight */}
        <div className="spotlight-layer absolute inset-0" />
        {/* Vignette */}
        <div className="absolute inset-0 vignette-layer" />
        {/* Grain */}
        <div className="absolute inset-0 grain-layer" />
        {/* Light sweep */}
        <div className="absolute inset-0 sweep-layer" />
        {/* Monogram watermark */}
        <div className="absolute inset-0 watermark-layer flex items-start justify-center pt-20">
          <div className="select-none font-serif text-[200px] leading-none text-lumaire-brown/5">
            L
          </div>
        </div>
      </div>

      {/* Top subtle nav */}
      <header className="relative z-10 mx-auto max-w-6xl px-6 pt-8">
        <div className="flex items-center justify-between">
          <UnderlineLink href="#features" onHoverSound={sound.playPaperTick}>
            Features
          </UnderlineLink>
          <UnderlineLink href="#pricing" onHoverSound={sound.playPaperTick}>
            Pricing
          </UnderlineLink>
          <UnderlineLink href="#faq" onHoverSound={sound.playPaperTick}>
            FAQ
          </UnderlineLink>
        </div>
      </header>

      {/* HERO */}
      <section className="relative z-10 mx-auto flex min-h-[78vh] max-w-5xl flex-col items-center justify-center px-6 pb-16 pt-16">
        <motion.h1
          className="font-script text-6xl md:text-7xl text-lumaire-wine mb-4"
          initial={
            reduce
              ? { opacity: 1 }
              : { opacity: 0, y: 10, filter: "blur(10px)", letterSpacing: "0.12em" }
          }
          animate={
            reduce
              ? { opacity: 1 }
              : { opacity: 1, y: 0, filter: "blur(0px)", letterSpacing: "0.02em" }
          }
          transition={{ duration: 1.15, ease: EASE_LUX }}
        >
          Lumaire Studio
        </motion.h1>

        <motion.p
          className="font-serif text-2xl md:text-[28px] text-lumaire-brown max-w-2xl leading-relaxed"
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 10, filter: "blur(8px)" }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.0, ease: EASE_LUX, delay: 0.15 }}
        >
          A sanctuary for wedding planners.
        </motion.p>

        <SignatureFlourish />

        <motion.p
          className="mt-8 max-w-xl text-lumaire-brown/75 leading-relaxed"
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 8, filter: "blur(6px)" }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.0, ease: EASE_LUX, delay: 0.35 }}
        >
          Built for planners who hold everything together — calm structure for timelines,
          vendors, documents, and clients.
        </motion.p>

        {/* CTA row */}
        <motion.div
          className="mt-12 flex flex-col sm:flex-row items-center gap-4"
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE_LUX, delay: 0.55 }}
        >
          <MagneticButton
            href="#early"
            onHoverSound={sound.playPaperTick}
            className="relative overflow-hidden"
          >
            <span className="relative z-10">Join the Atelier List</span>
            <span className="sheen pointer-events-none absolute inset-0" aria-hidden />
          </MagneticButton>

          <UnderlineLink href="#preview" onHoverSound={sound.playPaperTick} className="px-2 py-3">
            View the preview
          </UnderlineLink>
        </motion.div>

        {/* System Status Module */}
        <div className="mt-14 w-full max-w-xl">
          <TiltCard onHoverSound={sound.playPaperTick}>
            <motion.div
              className={cn(
                "relative p-8 border border-lumaire-tan rounded-sm bg-white/35",
                "backdrop-blur-[2px] shadow-[0_18px_60px_rgba(0,0,0,0.10)]"
              )}
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 14, filter: "blur(10px)" }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.0, ease: EASE_LUX, delay: 0.75 }}
            >
              <div className="flex items-start justify-between gap-6">
                <div className="text-left">
                  <p className="text-sm uppercase tracking-widest text-lumaire-brown/60 mb-2">
                    System Status
                  </p>

                  <div className="flex items-center gap-2 font-serif text-xl text-lumaire-brown">
                    <span className="relative inline-flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-lumaire-wine/30 animate-ping" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-lumaire-wine/60" />
                    </span>
                    Ready for Phase 1 Build
                  </div>

                  <div className="mt-3 text-lumaire-brown/70 leading-relaxed">
                    A calm command center — designed to feel like a studio, not a spreadsheet.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStatusOpen((v) => !v)}
                  onMouseEnter={sound.playPaperTick}
                  className="shrink-0 text-xs uppercase tracking-[0.22em] text-lumaire-brown/70 hover:text-lumaire-brown transition-colors"
                >
                  {statusOpen ? "Close" : "Peek"}
                </button>
              </div>

              {/* Progress bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-lumaire-brown/60">
                  <span>Phase 1: Foundations</span>
                  <span>12%</span>
                </div>
                <div className="mt-2 h-1 w-full bg-lumaire-tan/40 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-lumaire-wine/50"
                    initial={reduce ? { width: "12%" } : { width: "0%" }}
                    animate={{ width: "12%" }}
                    transition={{ duration: 1.2, ease: EASE_LUX, delay: 0.95 }}
                  />
                </div>
              </div>

              <AnimatePresence initial={false}>
                {statusOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.7, ease: EASE_LUX }}
                    className="overflow-hidden"
                  >
                    <div className="mt-6 grid gap-3 text-left">
                      {[
                        ["Timeline Engine", "Online"],
                        ["Vendor CRM", "Synced"],
                        ["Client Portal", "Standing by"],
                      ].map(([k, v]) => (
                        <div
                          key={k}
                          className="flex items-center justify-between border border-lumaire-tan/60 rounded-sm px-4 py-3 bg-white/30"
                        >
                          <div className="font-serif text-lumaire-brown">{k}</div>
                          <div className="text-xs uppercase tracking-[0.22em] text-lumaire-brown/70">
                            {v}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </TiltCard>

          <ScrollHint />
        </div>
      </section>

      {/* FEATURES + STICKY MANIFESTO */}
      <section id="features" className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-24 text-left">
            <Reveal>
              <div className="text-xs uppercase tracking-[0.22em] text-lumaire-brown/60">
                A quieter way to run weddings
              </div>
              <h2 className="mt-4 font-serif text-4xl text-lumaire-brown leading-tight">
                A system that holds the weight with you.
              </h2>
              <p className="mt-5 text-lumaire-brown/75 leading-relaxed max-w-md">
                Lumaire is built around flow — the invisible work behind the magic:
                timelines, vendors, documents, and client trust.
              </p>
              <div className="mt-8 flex items-center gap-5">
                <UnderlineLink href="#early" onHoverSound={sound.playPaperTick}>
                  Request early access
                </UnderlineLink>
                <UnderlineLink href="#preview" onHoverSound={sound.playPaperTick}>
                  See preview
                </UnderlineLink>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-5">
              {features.map((f, idx) => (
                <Reveal key={f.title} delay={0.05 * idx}>
                  <div className="group border border-lumaire-tan rounded-sm bg-white/35 p-7 text-left transition-all duration-500 hover:shadow-[0_18px_55px_rgba(0,0,0,0.10)] hover:-translate-y-[2px]">
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <div className="font-serif text-2xl text-lumaire-brown">
                          {f.title}
                        </div>
                        <p className="mt-3 text-lumaire-brown/75 leading-relaxed">
                          {f.desc}
                        </p>
                      </div>
                      <div className="text-xs uppercase tracking-[0.22em] text-lumaire-brown/55 group-hover:text-lumaire-brown/70 transition-colors">
                        Included
                      </div>
                    </div>

                    <div className="mt-6 flex items-center gap-4">
                      <span className="inline-flex h-px w-10 bg-lumaire-brown/30" />
                      <span className="text-xs uppercase tracking-[0.22em] text-lumaire-brown/60">
                        calm, structured, reliable
                      </span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.2} className="mt-10">
              <div className="grid sm:grid-cols-3 gap-4">
                {benefits.map((b) => (
                  <div
                    key={b.k}
                    className="border border-lumaire-tan rounded-sm bg-white/30 p-6 text-left"
                  >
                    <div className="text-xs uppercase tracking-[0.22em] text-lumaire-brown/60">
                      {b.k}
                    </div>
                    <div className="mt-2 font-serif text-xl text-lumaire-brown">
                      {b.v}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* WOW PREVIEW STACK */}
      <section id="preview" ref={wowRef} className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <div className="text-xs uppercase tracking-[0.22em] text-lumaire-brown/60">
            A preview of the studio
          </div>
          <h2 className="mt-4 font-serif text-4xl text-lumaire-brown">
            Elegant, functional, and quietly powerful.
          </h2>
          <p className="mt-5 text-lumaire-brown/75 leading-relaxed max-w-2xl mx-auto">
            Replace these placeholders with real screenshots later — the motion and composition will
            already feel high-end.
          </p>
        </Reveal>

        <div className="mt-12 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 text-left">
            <Reveal>
              <div className="border border-lumaire-tan rounded-sm bg-white/35 p-7">
                <div className="font-serif text-2xl text-lumaire-brown">
                  The calm command center
                </div>
                <p className="mt-3 text-lumaire-brown/75 leading-relaxed">
                  One place for the whole wedding: tasks, milestones, documents, vendors, and the
                  client experience — without noise.
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <UnderlineLink href="#early" onHoverSound={sound.playPaperTick}>
                    Join early access
                  </UnderlineLink>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <div className="relative">
              {/* Stacked “screens” */}
              <motion.div style={{ y: y1 }} className="relative z-30">
                <div className="border border-lumaire-tan rounded-sm bg-white/45 p-6 shadow-[0_30px_70px_rgba(0,0,0,0.12)]">
                  <div className="flex items-center justify-between">
                    <div className="text-xs uppercase tracking-[0.22em] text-lumaire-brown/60">
                      Timeline
                    </div>
                    <div className="text-xs uppercase tracking-[0.22em] text-lumaire-brown/50">
                      Week of event
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {["Final vendor confirmations", "Seating chart lock", "Rehearsal dinner run-through"].map(
                      (t) => (
                        <div
                          key={t}
                          className="flex items-center justify-between border border-lumaire-tan/60 rounded-sm px-4 py-3 bg-white/30"
                        >
                          <div className="text-lumaire-brown font-serif">{t}</div>
                          <div className="text-xs uppercase tracking-[0.22em] text-lumaire-brown/60">
                            Ready
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div style={{ y: y2 }} className="relative z-20 -mt-6 ml-6">
                <div className="border border-lumaire-tan rounded-sm bg-white/35 p-6 shadow-[0_28px_65px_rgba(0,0,0,0.10)]">
                  <div className="text-xs uppercase tracking-[0.22em] text-lumaire-brown/60">
                    Vendor CRM
                  </div>
                  <div className="mt-4 grid sm:grid-cols-2 gap-3">
                    {["Florals", "Venue", "Photography", "Catering"].map((t) => (
                      <div
                        key={t}
                        className="border border-lumaire-tan/60 rounded-sm px-4 py-3 bg-white/30"
                      >
                        <div className="font-serif text-lumaire-brown">{t}</div>
                        <div className="text-xs uppercase tracking-[0.22em] text-lumaire-brown/55 mt-1">
                          Synced
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div style={{ y: y3 }} className="relative z-10 -mt-6 ml-12">
                <div className="border border-lumaire-tan rounded-sm bg-white/30 p-6 shadow-[0_24px_55px_rgba(0,0,0,0.08)]">
                  <div className="text-xs uppercase tracking-[0.22em] text-lumaire-brown/60">
                    Client Portal
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="h-3 w-2/3 rounded bg-lumaire-tan/40" />
                    <div className="h-3 w-5/6 rounded bg-lumaire-tan/30" />
                    <div className="h-3 w-1/2 rounded bg-lumaire-tan/35" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <div className="text-xs uppercase tracking-[0.22em] text-lumaire-brown/60">
            Pricing
          </div>
          <h2 className="mt-4 font-serif text-4xl text-lumaire-brown">
            Founding access, crafted for planners.
          </h2>
          <p className="mt-5 text-lumaire-brown/75 leading-relaxed max-w-2xl mx-auto">
            Keep these as placeholders until you finalize pricing. The layout is already “premium.”
          </p>
        </Reveal>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {[
            {
              name: "Studio",
              price: "$29",
              note: "per month",
              perks: ["Core timeline", "Vendor CRM", "Client portal basics"],
            },
            {
              name: "Atelier",
              price: "$59",
              note: "per month",
              perks: ["Everything in Studio", "Automation tools", "White-glove onboarding"],
              featured: true,
            },
            {
              name: "Maison",
              price: "$99",
              note: "per month",
              perks: ["Everything in Atelier", "Team roles", "Advanced reporting"],
            },
          ].map((p, idx) => (
            <Reveal key={p.name} delay={0.06 * idx}>
              <div
                className={cn(
                  "relative border border-lumaire-tan rounded-sm p-8 text-left bg-white/35 transition-all duration-500 hover:-translate-y-[2px] hover:shadow-[0_18px_55px_rgba(0,0,0,0.10)]",
                  p.featured && "bg-white/45"
                )}
              >
                {p.featured && (
                  <div className="absolute -top-3 left-6 border border-lumaire-tan bg-lumaire-cream px-3 py-1 text-xs uppercase tracking-[0.22em] text-lumaire-brown/70">
                    Most loved
                  </div>
                )}
                <div className="text-xs uppercase tracking-[0.22em] text-lumaire-brown/60">
                  {p.name}
                </div>
                <div className="mt-3 font-serif text-4xl text-lumaire-brown">
                  {p.price}
                  <span className="ml-2 text-base text-lumaire-brown/60">{p.note}</span>
                </div>
                <div className="mt-6 space-y-2 text-lumaire-brown/75">
                  {p.perks.map((t) => (
                    <div key={t} className="flex items-start gap-3">
                      <span className="mt-2 inline-block h-1 w-1 rounded-full bg-lumaire-wine/50" />
                      <span className="leading-relaxed">{t}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <MagneticButton
                    href="#early"
                    onHoverSound={sound.playPaperTick}
                    className={cn(
                      "w-full justify-center",
                      p.featured && "border-lumaire-wine/40"
                    )}
                  >
                    Choose {p.name}
                  </MagneticButton>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* EARLY ACCESS */}
      <section id="early" className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <div className="border border-lumaire-tan rounded-sm bg-white/35 p-10 md:p-12">
            <div className="text-xs uppercase tracking-[0.22em] text-lumaire-brown/60">
              Early access
            </div>
            <h2 className="mt-4 font-serif text-4xl text-lumaire-brown">
              Join the Atelier List
            </h2>
            <p className="mt-5 text-lumaire-brown/75 leading-relaxed max-w-2xl mx-auto">
              Replace this with your real form later (Mailchimp, ConvertKit, custom, etc.).
              For now, the interaction + polish is here.
            </p>

            <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-4">
              <div className="w-full md:w-[420px] border border-lumaire-tan rounded-sm bg-white/30 px-5 py-3 text-left">
                <div className="text-xs uppercase tracking-[0.22em] text-lumaire-brown/55">
                  Email
                </div>
                <div className="mt-2 h-4 w-2/3 rounded bg-lumaire-tan/35" aria-hidden />
              </div>
              <MagneticButton
                onHoverSound={sound.playPaperTick}
                onClick={() => {
                  sound.playPaperTick();
                  // Replace with submit action
                  alert("Hook this button to your signup flow.");
                }}
                className="relative overflow-hidden"
              >
                <span className="relative z-10">Request Access</span>
                <span className="sheen pointer-events-none absolute inset-0" aria-hidden />
              </MagneticButton>
            </div>

            <div className="mt-8 text-xs uppercase tracking-[0.22em] text-lumaire-brown/50">
              Privacy-first • No ads • Calm by design
            </div>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <div className="text-xs uppercase tracking-[0.22em] text-lumaire-brown/60">
            FAQ
          </div>
          <h2 className="mt-4 font-serif text-4xl text-lumaire-brown">
            Questions, answered gently.
          </h2>
        </Reveal>

        <div className="mt-10">
          <Accordion items={faq} />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-lumaire-tan/70 pt-8">
          <div className="text-lumaire-brown/70 text-sm">
            <span className="font-serif text-lumaire-brown">Lumaire Studio</span> — crafted for the work behind the magic.
          </div>

          <div className="flex items-center gap-6">
            <UnderlineLink href="#features" onHoverSound={sound.playPaperTick}>
              Back to top
            </UnderlineLink>

            {/* Optional sound toggle */}
            <button
              type="button"
              onClick={async () => {
                // user gesture required for audio resume in many browsers
                sound.setEnabled(!sound.enabled);
                await sound.playPaperTick();
              }}
              className="text-sm uppercase tracking-[0.18em] text-lumaire-brown/60 hover:text-lumaire-brown transition-colors"
            >
              Sound: {sound.enabled ? "On" : "Off"}
            </button>
          </div>
        </div>
      </footer>

      {/* Styles for ambient layers & sheen */}
      <style jsx global>{`
        :root {
          --mx: 50vw;
          --my: 35vh;
        }

        /* Spotlight follows cursor */
        .spotlight-layer {
          background: radial-gradient(
            650px circle at var(--mx) var(--my),
            rgba(141, 56, 73, 0.10),
            rgba(141, 56, 73, 0.05) 35%,
            rgba(0, 0, 0, 0) 70%
          );
        }

        /* Vignette */
        .vignette-layer {
          background: radial-gradient(
            circle at 50% 30%,
            rgba(255, 255, 255, 0) 35%,
            rgba(0, 0, 0, 0.08) 100%
          );
          mix-blend-mode: multiply;
        }

        /* Grain (CSS-only) */
        .grain-layer {
          opacity: 0.12;
          background-image:
            repeating-linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.12),
              rgba(0, 0, 0, 0.12) 1px,
              rgba(0, 0, 0, 0) 2px,
              rgba(0, 0, 0, 0) 4px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.08),
              rgba(0, 0, 0, 0.08) 1px,
              rgba(0, 0, 0, 0) 2px,
              rgba(0, 0, 0, 0) 5px
            );
          filter: contrast(120%) brightness(105%);
          mix-blend-mode: soft-light;
        }

        /* Slow diagonal sweep */
        .sweep-layer {
          opacity: 0.18;
          background: linear-gradient(
            120deg,
            rgba(255, 255, 255, 0) 35%,
            rgba(255, 255, 255, 0.35) 48%,
            rgba(255, 255, 255, 0) 62%
          );
          animation: sweep 18s ${EASE_LUX.join(",")} infinite;
          transform: translateX(-40%);
          mix-blend-mode: overlay;
        }

        @keyframes sweep {
          0% {
            transform: translateX(-55%);
          }
          50% {
            transform: translateX(55%);
          }
          100% {
            transform: translateX(-55%);
          }
        }

        /* Button sheen */
        .sheen {
          background: linear-gradient(
            120deg,
            rgba(255, 255, 255, 0) 20%,
            rgba(255, 255, 255, 0.35) 45%,
            rgba(255, 255, 255, 0) 70%
          );
          transform: translateX(-120%);
          transition: transform 900ms ${EASE_LUX.join(",")};
          opacity: 0.75;
        }
        a:hover .sheen,
        button:hover .sheen {
          transform: translateX(120%);
        }
      `}</style>
    </main>
  );
}
