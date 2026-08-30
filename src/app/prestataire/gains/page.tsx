"use client";

import { useState } from "react";
import { ArrowUpRight, CheckCircle2, RefreshCw, Wallet, X, Sparkles } from "lucide-react";
import { useUpStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

export default function GainsPage() {
  const hydrated = useHydrated();
  const balance = useUpStore((s) => s.prestataireBalance);
  const gains = useUpStore((s) => s.prestataireGains);

  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [operator, setOperator] = useState<"airtel_money" | "moov_money">(
    "airtel_money",
  );
  const [phone, setPhone] = useState("074123456");
  const [amount, setAmount] = useState("50000");
  const [isProcessing, setIsProcessing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);

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
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#D4AF37]">
          <Sparkles size={13} />
          Espace Prestataire
        </span>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#FAFAF9]">
          Mes Gains &amp; Versements
        </h1>
        <p className="mt-1 text-xs text-[#A1A1AA]">
          Honoraires libérés après validation de fin de mission par code OTP.
        </p>
      </div>

      {/* Carte du Solde */}
      <div className="mt-6 rounded-[28px] border border-[rgba(212,175,55,0.3)] bg-gradient-to-br from-[#D4AF37]/20 via-[#151518] to-[#151518] p-6 shadow-2xl">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#D4AF37]">
          <Wallet size={15} />
          Solde disponible
        </span>
        <p className="mt-2 font-display text-4xl font-bold text-[#FAFAF9]">
          {hydrated ? balance.toLocaleString("fr-FR") : "96 000"}{" "}
          <span className="text-base font-normal text-[#A1A1AA]">FCFA</span>
        </p>

        <button
          type="button"
          onClick={() => {
            setIsWithdrawOpen(true);
            setWithdrawSuccess(null);
          }}
          className="mt-5 inline-flex items-center gap-1.5 rounded-2xl bg-[#D4AF37] px-6 py-3 text-xs font-bold text-[#0B0B0D] transition hover:bg-[#F1D875] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
        >
          <span>Retirer vers Mobile Money</span>
          <ArrowUpRight size={15} />
        </button>
      </div>

      {/* Historique des mouvements */}
      <div className="mt-8">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#A1A1AA] px-1">
          Historique des transactions
        </h2>

        <div className="mt-3 space-y-2.5">
          {gains.map((l) => (
            <div
              key={l.id}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#151518] p-4 shadow-md"
            >
              <div>
                <p className="text-xs font-bold text-[#FAFAF9]">{l.label}</p>
                <p className="text-[11px] text-[#A1A1AA]">{l.date}</p>
              </div>
              <span
                className={`font-mono text-xs font-bold ${
                  l.montant.startsWith("+") ? "text-[#D4AF37]" : "text-[#A1A1AA]"
                }`}
              >
                {l.montant} FCFA
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Retrait Mobile Money */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-5 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-[28px] border border-[rgba(212,175,55,0.3)] bg-[#151518] p-6 text-center shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                <Wallet size={16} />
                Retrait Rapide
              </span>
              <button
                type="button"
                onClick={() => setIsWithdrawOpen(false)}
                className="text-[#A1A1AA] hover:text-[#FAFAF9]"
              >
                <X size={18} />
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="my-5 text-center space-y-3">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#22C55E]/20 text-[#22C55E]">
                  <CheckCircle2 size={30} />
                </span>
                <h3 className="font-display text-lg font-bold text-[#FAFAF9]">
                  Transfert Réussi
                </h3>
                <p className="text-xs text-[#A1A1AA]">{withdrawSuccess}</p>
                <button
                  type="button"
                  onClick={() => setIsWithdrawOpen(false)}
                  className="mt-4 w-full rounded-xl bg-[#D4AF37] py-3 text-xs font-bold text-[#0B0B0D]"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="mt-4 space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                    Opérateur Mobile Money
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOperator("airtel_money")}
                      className={`rounded-2xl border p-3 text-center text-xs font-bold transition ${
                        operator === "airtel_money"
                          ? "border-red-500 bg-red-950/40 text-[#FAFAF9]"
                          : "border-white/10 bg-[#0B0B0D] text-[#A1A1AA]"
                      }`}
                    >
                      Airtel Money
                    </button>
                    <button
                      type="button"
                      onClick={() => setOperator("moov_money")}
                      className={`rounded-2xl border p-3 text-center text-xs font-bold transition ${
                        operator === "moov_money"
                          ? "border-cyan-500 bg-cyan-950/40 text-[#FAFAF9]"
                          : "border-white/10 bg-[#0B0B0D] text-[#A1A1AA]"
                      }`}
                    >
                      Moov Money
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="withdraw-phone-input"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]"
                  >
                    Numéro de réception
                  </label>
                  <div className="relative mt-1 flex items-center">
                    <span className="absolute left-3 text-xs text-[#A1A1AA] font-bold">
                      +241
                    </span>
                    <input
                      id="withdraw-phone-input"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full rounded-xl border border-white/10 bg-[#0B0B0D] py-2.5 pl-14 pr-3 text-xs text-[#FAFAF9] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="withdraw-amount-field"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]"
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
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#0B0B0D] p-2.5 text-xs text-[#FAFAF9] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsWithdrawOpen(false)}
                    className="flex-1 rounded-xl border border-white/10 py-3 text-xs font-medium text-[#A1A1AA] hover:text-[#FAFAF9]"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing || parseInt(amount, 10) > balance}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#D4AF37] py-3 text-xs font-bold text-[#0B0B0D] hover:bg-[#F1D875] disabled:opacity-50"
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
