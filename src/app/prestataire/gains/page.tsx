"use client";

import { useState } from "react";
import { ArrowUpRight, CheckCircle2, RefreshCw, Wallet, X } from "lucide-react";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
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
    <>
      <PageHeader eyebrow="Prestataire" title="Mes Gains" subtitle="Honoraires libérés après validation de mission." />

      <div className="px-5 pb-24">
        {/* Carte du Solde */}
        <div className="rounded-3xl border border-up-gold/40 bg-gradient-to-br from-up-gold/20 via-up-surface to-up-surface p-6 shadow-xl">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-up-gold">
            <Wallet size={15} />
            Solde disponible
          </span>
          <p className="mt-2 font-display text-4xl font-bold text-up-white">
            {hydrated ? balance.toLocaleString("fr-FR") : "96 000"}{" "}
            <span className="text-base font-medium text-up-gray">FCFA</span>
          </p>

          <button
            type="button"
            onClick={() => {
              setIsWithdrawOpen(true);
              setWithdrawSuccess(null);
            }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-up-gold px-5 py-2.5 text-xs font-bold text-up-black transition hover:bg-up-gold-soft shadow-[0_0_15px_rgba(212,175,55,0.3)]"
          >
            <span>Retirer vers Mobile Money</span>
            <ArrowUpRight size={15} />
          </button>
        </div>

        {/* Historique des mouvements */}
        <div className="mt-6">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-up-gray">
            Historique des transactions
          </h2>

          <div className="mt-3 space-y-2.5">
            {gains.map((l) => (
              <Card key={l.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-up-white">{l.label}</p>
                  <p className="text-xs text-up-gray">{l.date}</p>
                </div>
                <span
                  className={`font-mono text-sm font-bold ${
                    l.montant.startsWith("+") ? "text-up-gold" : "text-up-gray"
                  }`}
                >
                  {l.montant} FCFA
                </span>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Retrait Mobile Money */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-up-black/85 p-5 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-up-gold/40 bg-up-surface p-6 text-center shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-up-gold">
                <Wallet size={16} />
                Retrait Rapide
              </span>
              <button
                type="button"
                onClick={() => setIsWithdrawOpen(false)}
                className="text-up-gray hover:text-up-white"
              >
                <X size={18} />
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="my-5 text-center space-y-3">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 size={30} />
                </span>
                <h3 className="font-display text-lg font-bold text-up-white">
                  Transfert Réussi
                </h3>
                <p className="text-xs text-up-gray">{withdrawSuccess}</p>
                <button
                  type="button"
                  onClick={() => setIsWithdrawOpen(false)}
                  className="mt-4 w-full rounded-xl bg-up-gold py-2.5 text-xs font-bold text-up-black"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="mt-4 space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-up-gold">
                    Opérateur Mobile Money
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOperator("airtel_money")}
                      className={`rounded-xl border p-3 text-center text-xs font-bold transition ${
                        operator === "airtel_money"
                          ? "border-red-500 bg-red-950/40 text-up-white"
                          : "border-white/10 bg-up-black/40 text-up-gray"
                      }`}
                    >
                      Airtel Money
                    </button>
                    <button
                      type="button"
                      onClick={() => setOperator("moov_money")}
                      className={`rounded-xl border p-3 text-center text-xs font-bold transition ${
                        operator === "moov_money"
                          ? "border-cyan-500 bg-cyan-950/40 text-up-white"
                          : "border-white/10 bg-up-black/40 text-up-gray"
                      }`}
                    >
                      Moov Money
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-up-gray">
                    Numéro de réception
                  </label>
                  <div className="relative mt-1 flex items-center">
                    <span className="absolute left-3 text-xs text-up-gray font-bold">
                      +241
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full rounded-xl border border-white/10 bg-up-black/60 py-2.5 pl-14 pr-3 text-xs text-up-white focus:border-up-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-up-gray">
                    Montant à retirer (FCFA)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    max={balance}
                    min={1000}
                    required
                    className="mt-1 w-full rounded-xl border border-white/10 bg-up-black/60 p-2.5 text-xs text-up-white focus:border-up-gold focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsWithdrawOpen(false)}
                    className="flex-1 rounded-xl border border-white/10 py-3 text-xs font-medium text-up-gray hover:text-up-white"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing || parseInt(amount, 10) > balance}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-up-gold py-3 text-xs font-bold text-up-black hover:bg-up-gold-soft disabled:opacity-50"
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
    </>
  );
}
