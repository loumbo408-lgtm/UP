"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Volume2,
  VolumeX,
  X,
  Sparkles,
  ShieldCheck,
  Building2,
  ChevronRight,
  Play,
} from "lucide-react";
import { UpLogo } from "@/components/brand/UpLogo";

interface CinematicIntroProps {
  onComplete?: () => void;
  forceOpen?: boolean;
}

interface Scene {
  id: number;
  image: string;
  badge: string;
  title: string;
  subtitle: string;
  duration: number; // en ms
}

const SCENES: Scene[] = [
  {
    id: 1,
    image: "/cinematic/lobby-welcome.jpg",
    badge: "CONCIERGERIE PRIVÉE · LIBREVILLE",
    title: "Le Prestige des Lieux d'Exception",
    subtitle:
      "Accédez aux salons VIP, palaces et adresses confidentielles de Libreville, avec un accueil digne des plus grands standards internationaux.",
    duration: 5000,
  },
  {
    id: 2,
    image: "/cinematic/match-scene.jpg",
    badge: "MISE EN RELATION D'ÉLITE",
    title: "L'Art de l'Accompagnement Social",
    subtitle:
      "Dîners d'affaires, soirées de gala ou événements diplomatiques : faites appel à des accompagnateurs cultivés, élégants et rigoureusement vérifiés.",
    duration: 5500,
  },
  {
    id: 3,
    image: "/cinematic/match-scene.jpg",
    badge: "SÉCURITÉ & PROTOCOLE STRICT",
    title: "Confidentialité & Séquestre Garanti",
    subtitle:
      "Lieux publics obligatoires, paiements protégés par séquestre Airtel & Moov Money débloqués par code OTP à l'issue de la mission.",
    duration: 6000,
  },
];

export function CinematicIntro({ onComplete, forceOpen = false }: CinematicIntroProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Vérifier si l'utilisateur a déjà vu l'animation dans cette session
  useEffect(() => {
    if (forceOpen) {
      setIsVisible(true);
      setCurrentSceneIndex(0);
      setProgress(0);
      return;
    }

    try {
      const hasSeen = sessionStorage.getItem("up_has_seen_cinematic_intro");
      if (!hasSeen) {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(true);
    }
  }, [forceOpen]);

  // Écouter l'événement global pour rejouer l'intro à la demande
  useEffect(() => {
    const handleOpen = () => {
      setIsFadingOut(false);
      setIsVisible(true);
      setCurrentSceneIndex(0);
      setProgress(0);
    };

    window.addEventListener("open-cinematic-intro", handleOpen);
    return () => window.removeEventListener("open-cinematic-intro", handleOpen);
  }, []);

  // Jouer une note d'ambiance douce et luxueuse en Web Audio (sans dépendance externe)
  const playCinematicChime = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }

      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      if (!audioCtxRef.current || isMuted) return;

      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      // Accord doux lounge (Fa mineur 9e ou La bémol majeur prestige)
      const frequencies = [220, 277.18, 329.63, 415.3, 554.37];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.04, now + idx * 0.08 + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 2.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 3);
      });
    } catch {
      // Audio Web non bloquant
    }
  };

  // Progression temporelle des scènes
  useEffect(() => {
    if (!isVisible || isFadingOut) return;

    const activeScene = SCENES[currentSceneIndex];
    const totalDuration = activeScene.duration;
    const intervalTime = 50;
    const increment = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentSceneIndex < SCENES.length - 1) {
            setCurrentSceneIndex((idx) => idx + 1);
            return 0;
          } else {
            // Fin de la dernière scène
            clearInterval(timer);
            return 100;
          }
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isVisible, currentSceneIndex, isFadingOut]);

  // Déclencher le son lors des changements de scène
  useEffect(() => {
    if (isVisible && !isMuted) {
      playCinematicChime();
    }
  }, [currentSceneIndex, isMuted, isVisible]);

  const handleClose = () => {
    setIsFadingOut(true);
    try {
      sessionStorage.setItem("up_has_seen_cinematic_intro", "true");
    } catch {
      // ignore
    }

    setTimeout(() => {
      setIsVisible(false);
      setIsFadingOut(false);
      if (onComplete) onComplete();
    }, 600);
  };

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    if (nextState === false) {
      setTimeout(() => playCinematicChime(), 100);
    }
  };

  if (!isVisible) return null;

  const scene = SCENES[currentSceneIndex];

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col justify-between overflow-hidden bg-black text-white transition-opacity duration-700 select-none ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* 1. Arrière-plan Cinématographique avec Ken Burns Effect */}
      <div className="absolute inset-0 z-0">
        {SCENES.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === currentSceneIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <div className="relative h-full w-full overflow-hidden animate-[kenburns_14s_ease-out_infinite_alternate]">
              <Image
                src={s.image}
                alt={s.title}
                fill
                priority={idx === 0}
                className="object-cover object-center"
              />
              {/* Masque de dégradé sombre cinématographique & halo violet royal */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/70" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(136,7,168,0.22)_0%,transparent_75%)]" />
            </div>
          </div>
        ))}
      </div>

      {/* 2. Bandes Noires Cinéma Format 2.39:1 (Letterbox) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-10 md:h-14 bg-black/90 z-20 shadow-lg" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 md:h-14 bg-black/90 z-20 shadow-lg" />

      {/* 3. Barre Supérieure : Brand UP, Contrôles Son & Sauter */}
      <header className="relative z-30 flex items-center justify-between px-6 pt-12 md:pt-14 md:px-12">
        {/* Logo UP Blanc & Violet Lumineux */}
        <div className="flex items-center gap-3">
          <UpLogo size={36} variant="violet" showText={true} />
          <span className="hidden sm:inline-block rounded-full border border-up-400/40 bg-up-950/60 backdrop-blur-md px-3 py-0.5 text-[10px] font-bold tracking-widest text-[#E7ACF5] uppercase">
            Conciergerie Privée
          </span>
        </div>

        {/* Boutons d'Action : Son & Passer */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSound}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white/80 transition hover:bg-white/20 hover:text-white"
            title={isMuted ? "Activer l'ambiance sonore" : "Couper le son"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="text-up-400" />}
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="group flex items-center gap-2 rounded-full border border-white/20 bg-black/50 backdrop-blur-md px-4 py-2 text-xs font-semibold tracking-wider text-white transition hover:border-up-400 hover:bg-up-900/40"
          >
            <span>PASSER L&apos;INTRODUCTION</span>
            <X size={14} className="transition-transform group-hover:rotate-90" />
          </button>
        </div>
      </header>

      {/* 4. Contenu Central Scénarisé */}
      <main className="relative z-30 mx-auto w-full max-w-4xl px-6 md:px-12 py-8 my-auto">
        <div className="space-y-4">
          {/* Badge thématique */}
          <div className="inline-flex items-center gap-2 rounded-full border border-up-400/40 bg-up-950/70 backdrop-blur-md px-4 py-1.5 text-xs font-bold tracking-widest text-[#E7ACF5] shadow-lg shadow-up-500/10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Sparkles size={14} className="text-up-300" />
            <span>{scene.badge}</span>
          </div>

          {/* Titre Cinématographique */}
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-3 duration-700">
            {scene.title}
          </h1>

          {/* Sous-titre explicatif */}
          <p className="max-w-2xl text-sm sm:text-base md:text-lg text-white/85 leading-relaxed drop-shadow-md animate-in fade-in slide-in-from-bottom-4 duration-700">
            {scene.subtitle}
          </p>

          {/* Scène 3 : Badges de Réassurance et Garanties */}
          {currentSceneIndex === 2 && (
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-500">
              <div className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-3">
                <Building2 size={18} className="text-up-400 shrink-0" />
                <span className="text-xs font-semibold">Lieux Publics Obligatoires</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-3">
                <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
                <span className="text-xs font-semibold">Séquestre Airtel &amp; Moov</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-3">
                <Sparkles size={18} className="text-amber-300 shrink-0" />
                <span className="text-xs font-semibold">Accompagnateurs Certifiés</span>
              </div>
            </div>
          )}

          {/* Boutons d'Action Clés */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-up-600 via-up-500 to-up-400 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-up-600/30 transition hover:shadow-up-500/50 hover:scale-[1.02] active:scale-95"
            >
              <span>ENTRER DANS L&apos;UNIVERS UP</span>
              <ChevronRight size={18} />
            </button>

            {currentSceneIndex < SCENES.length - 1 && (
              <button
                type="button"
                onClick={() => {
                  setCurrentSceneIndex((idx) => idx + 1);
                  setProgress(0);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/40 backdrop-blur-md px-5 py-3.5 text-xs font-bold text-white/90 transition hover:bg-white/15 hover:text-white"
              >
                <span>Scène suivante</span>
                <Play size={12} className="fill-current" />
              </button>
            )}
          </div>
        </div>
      </main>

      {/* 5. Barre Inférieure : Progression & Pagination des Scènes */}
      <footer className="relative z-30 px-6 pb-12 md:pb-14 md:px-12">
        <div className="mx-auto max-w-4xl space-y-3">
          {/* Ligne de progression fine */}
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full bg-gradient-to-r from-up-500 to-up-300 transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Indicateurs de Scènes */}
          <div className="flex items-center justify-between text-xs text-white/60">
            <div className="flex items-center gap-2">
              {SCENES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setCurrentSceneIndex(idx);
                    setProgress(0);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentSceneIndex
                      ? "w-8 bg-up-400"
                      : "w-2 bg-white/30 hover:bg-white/60"
                  }`}
                  aria-label={`Aller à la scène ${s.id}`}
                />
              ))}
            </div>

            <span className="font-mono text-[11px] tracking-wider text-white/75">
              0{currentSceneIndex + 1} / 0{SCENES.length}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
