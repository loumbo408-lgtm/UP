import { Check, Crown } from "lucide-react";
import { PageHeader } from "@/components/page-header";

const avantages = [
  "Accès prioritaire aux profils les mieux notés",
  "Frais de service offerts",
  "Conciergerie dédiée 24/7",
  "Prestations confidentielles garanties",
];

export default function VipPage() {
  return (
    <>
      <PageHeader
        eyebrow="Abonnement"
        title="UP VIP"
        subtitle="L'expérience prestige, sans compromis."
      />

      <div className="px-5">
        <div className="overflow-hidden rounded-3xl border border-up-gold/40 bg-gradient-to-b from-up-gold/20 to-transparent p-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-up-black/40 px-3 py-1 text-xs font-semibold text-up-gold">
            <Crown size={14} />
            Membre VIP
          </span>

          <p className="mt-4 font-display text-3xl font-bold text-up-white">
            25 000{" "}
            <span className="text-base font-medium text-up-gray">
              FCFA / mois
            </span>
          </p>

          <ul className="mt-5 space-y-3">
            {avantages.map((a) => (
              <li
                key={a}
                className="flex items-start gap-3 text-sm text-up-white"
              >
                <Check size={16} className="mt-0.5 shrink-0 text-up-gold" />
                {a}
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="mt-6 w-full rounded-xl bg-up-gold py-3 text-sm font-semibold text-up-black transition hover:bg-up-gold-soft"
          >
            Devenir membre VIP
          </button>
        </div>
      </div>
    </>
  );
}
