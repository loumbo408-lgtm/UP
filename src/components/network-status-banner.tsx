"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw, Wifi, WifiOff, X } from "lucide-react";

export function NetworkStatusBanner() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSlow, setIsSlow] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [reconnectedMessage, setReconnectedMessage] = useState<boolean>(false);

  useEffect(() => {
    // Vérification initiale
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);

      // Détection connexion lente (Network Information API si supportée)
      const connection = (navigator as unknown as { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
      if (connection) {
        if (connection.effectiveType === "2g" || connection.effectiveType === "slow-2g" || connection.saveData) {
          setIsSlow(true);
        }
      }

      const handleOnline = () => {
        setIsOnline(true);
        setDismissed(false);
        setReconnectedMessage(true);
        const timer = setTimeout(() => {
          setReconnectedMessage(false);
        }, 3500);
        return () => clearTimeout(timer);
      };

      const handleOffline = () => {
        setIsOnline(false);
        setDismissed(false);
        setReconnectedMessage(false);
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  if (dismissed) return null;

  if (reconnectedMessage) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all animate-in slide-in-from-top">
        <div className="flex items-center gap-2">
          <Wifi size={14} className="text-white animate-pulse" />
          <span>Connexion Internet rétablie. Données synchronisées.</span>
        </div>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-red-500/50 bg-red-950/95 px-4 py-2.5 text-xs text-red-200 shadow-xl backdrop-blur-md animate-in slide-in-from-top">
        <div className="flex items-center gap-2">
          <WifiOff size={15} className="shrink-0 text-red-400 animate-bounce" />
          <span>
            <strong className="text-white">Connexion Internet coupée :</strong>{" "}
            Mode hors-ligne actif (cache local préservé).
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex items-center gap-1 rounded-lg bg-red-800/80 px-2 py-1 text-[11px] font-bold text-white hover:bg-red-700"
          >
            <RefreshCw size={11} />
            <span>Réessayer</span>
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-red-400 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    );
  }

  if (isSlow) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-amber-500/40 bg-amber-950/90 px-4 py-1.5 text-xs text-amber-200 shadow-lg backdrop-blur-md animate-in slide-in-from-top">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="shrink-0 text-amber-400" />
          <span>
            <strong className="text-white">Réseau 3G/Edge ralenti :</strong>{" "}
            Optimisation des images WebP et mode faible consommation activés.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-amber-400 hover:text-white"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return null;
}
