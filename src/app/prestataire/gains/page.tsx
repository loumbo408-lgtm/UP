"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, CheckCircle2, RefreshCw, Wallet, X, Sparkles } from "lucide-react";
import { useUpStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { createClient } from "@/lib/supabase/client";

export default function GainsPage() {
  const hydrated = useHydrated();
  const balance = useUpStore((s) => s.prestataireBalance);
  const gains = useUpStore((s) => s.prestataireGains);

  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [operator, setOperator] = useState<"airtel_money" | "moov_money">(
    "airtel_money",
  );
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);

  // Charger le numéro réel du prestataire depuis Supabase
  useEffect(() => {
    async function loadPhone() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("phone")
            .eq("id", user.id)
            .maybeSingle();
          if (profile?.phone) {
            setPhone(profile.phone.replace(/^\+241/, ""));
          }
        }
      } catch {
        // ignore
      }
    }
    loadPhone();
  }, []);

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setWithdrawSuccess(
        `Retrait de ${parseInt(amount, 10).toLocaleString("fr-FR")} FCFA validé vers votre compte ${operator === "airtel_money" ? "Airtel Money" : "Moov Money"} (+241 ${phone}).`,
      );
    }, 800);
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-4 pb-12">
      <div className="px-1 py-3 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-up-200 bg-up-50 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-up-700">
          <Sparkles size={13} />
          Espace Prestataire
        </span>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#1D0F24]">
          Mes Gains &amp; Versements
        </h1>
        <p className="mt-1 text-xs text-[#6B5D73]">
          Honoraires libérés après validation de fin de mission par code OTP.
        </p>
      </div>

      {/* Carte du Solde */}
      <div className="mt-6 rounded-3xl border border-[#F0E6F3] bg-white p-6 shadow-xs">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-up-700">
          <Wallet size={15} />
          Solde disponible
        </span>
        <p className="mt-2 font-display text-4xl font-bold text-[#1D0F24]">
          {hydrated ? balance.toLocaleString("fr-FR") : "0"}{" "}
          <span className="text-base font-normal text-[#6B5D73]">FCFA</span>
        </p>

        <button
          type="button"
          onClick={() => {
            setIsWithdrawOpen(true);
            setWithdrawSuccess(null);
          }}
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-up-500 text-white hover:bg-up-600 shadow-md shadow-up-500/20 active:scale-[0.98] px-6 py-3 text-xs font-bold transition"
        >
          <span>Retirer vers Mobile Money</span>
          <ArrowUpRight size={15} />
        </button>
      </div>

      {/* Historique des mouvements */}
      <div className="mt-8">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#6B5D73] px-1">
          Historique des transactions
        </h2>

        <div className="mt-3 space-y-2.5">
          {gains.length === 0 ? (
            <div className="rounded-2xl border border-[#F0E6F3] bg-white p-6 text-center shadow-xs">
              <p className="text-xs font-semibold text-[#1D0F24]">Aucune transaction pour le moment</p>
              <p className="text-[11px] text-[#6B5D73] mt-1">
                Vos honoraires apparaîtront ici après chaque mission accomplie et validée par code OTP.
              </p>
            </div>
          ) : (
            gains.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between rounded-2xl border border-[#F0E6F3] bg-white p-4 shadow-xs"
              >
                <div>
                  <p className="text-xs font-bold text-[#1D0F24]">{l.label}</p>
                  <p className="text-[11px] text-[#6B5D73]">{l.date}</p>
                </div>
                <span
                  className={`font-mono text-xs font-bold ${
                    l.montant.startsWith("+") ? "text-emerald-600" : "text-[#6B5D73]"
                  }`}
                >
                  {l.montant} FCFA
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Retrait Mobile Money */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D0F24]/60 p-5 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-[#F0E6F3] bg-white p-6 text-center shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0E6F3] pb-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-up-700">
                <Wallet size={16} />
                Retrait Rapide
              </span>
              <button
                type="button"
                onClick={() => setIsWithdrawOpen(false)}
                className="text-[#6B5D73] hover:text-[#1D0F24]"
              >
                <X size={18} />
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="my-5 text-center space-y-3">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={30} />
                </span>
                <h3 className="font-display text-lg font-bold text-[#1D0F24]">
                  Transfert Réussi
                </h3>
                <p className="text-xs text-[#6B5D73]">{withdrawSuccess}</p>
                <button
                  type="button"
                  onClick={() => setIsWithdrawOpen(false)}
                  className="mt-4 w-full rounded-full bg-up-500 text-white hover:bg-up-600 py-3 text-xs font-bold shadow-md shadow-up-500/20"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="mt-4 space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-up-700">
                    Opérateur Mobile Money
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOperator("airtel_money")}
                      className={`rounded-2xl border p-3 text-center text-xs font-bold transition ${
                        operator === "airtel_money"
                          ? "border-up-500 bg-up-50 text-up-700"
                          : "border-[#F0E6F3] bg-[#FAF9FB] text-[#6B5D73]"
                      }`}
                    >
                      Airtel Money
                    </button>
                    <button
                      type="button"
                      onClick={() => setOperator("moov_money")}
                      className={`rounded-2xl border p-3 text-center text-xs font-bold transition ${
                        operator === "moov_money"
                          ? "border-up-500 bg-up-50 text-up-700"
                          : "border-[#F0E6F3] bg-[#FAF9FB] text-[#6B5D73]"
                      }`}
                    >
                      Moov Money
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="withdraw-phone-input"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#6B5D73]"
                  >
                    Numéro de réception
                  </label>
                  <div className="relative mt-1 flex items-center">
                    <span className="absolute left-3 text-xs text-[#6B5D73] font-bold">
                      +241
                    </span>
                    <input
                      id="withdraw-phone-input"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] py-2.5 pl-14 pr-3 text-xs text-[#1D0F24] focus:border-up-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="withdraw-amount-field"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#6B5D73]"
                  >
                    Montant à retirer (FCFA)
                  </label>
                  <input
                    id="withdraw-amount-field"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    max={balance}
                    min={1000}
                    required
                    className="mt-1 w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] p-2.5 text-xs text-[#1D0F24] focus:border-up-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsWithdrawOpen(false)}
                    className="flex-1 rounded-full border border-[#F0E6F3] py-3 text-xs font-medium text-[#6B5D73] hover:text-[#1D0F24]"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing || parseInt(amount, 10) > balance}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-up-500 text-white hover:bg-up-600 shadow-md shadow-up-500/20 active:scale-[0.98] py-3 text-xs font-bold disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <ArrowUpRight size={14} />
                    )}
                    <span>Confirmer</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
