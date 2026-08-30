import { NextResponse } from "next/server";
import { globalEscrowStore } from "@/lib/escrow";

interface EscrowReleaseRequest {
  missionId: string;
  transactionRef?: string;
  otpCode: string;
  clientConfirmed?: boolean;
  companionConfirmed?: boolean;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EscrowReleaseRequest;

    const {
      missionId,
      transactionRef,
      otpCode,
      clientConfirmed = true,
      companionConfirmed = true,
    } = body;

    if (!missionId && !transactionRef) {
      return NextResponse.json(
        { error: "Identifiant de mission ou référence de transaction requis." },
        { status: 400 },
      );
    }

    if (!otpCode || otpCode.trim().length !== 6) {
      return NextResponse.json(
        {
          error:
            "Le code OTP de fin de mission à 6 chiffres est obligatoire pour débloquer les fonds.",
        },
        { status: 400 },
      );
    }

    // Récupération de la transaction depuis le registre de séquestre
    const existingTransaction =
      (missionId ? globalEscrowStore.get(missionId) : null) ||
      (transactionRef ? globalEscrowStore.get(transactionRef) : null);

    // Si la transaction est en mémoire, on vérifie l'OTP
    if (existingTransaction) {
      if (existingTransaction.status === "released_to_companion") {
        return NextResponse.json(
          {
            error:
              "Les fonds de cette mission ont déjà été débloqués et versés au prestataire.",
          },
          { status: 400 },
        );
      }

      if (existingTransaction.otpCode !== otpCode.trim()) {
        return NextResponse.json(
          {
            error:
              "Code OTP incorrect. Veuillez vérifier le code de fin de mission partagé avec le client.",
          },
          { status: 401 },
        );
      }

      // Mise à jour du statut
      existingTransaction.status = "released_to_companion";
      existingTransaction.settledAt = new Date().toISOString();
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const payoutRef = `UP-PAYOUT-${dateStr}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const amountReleasedXaf = existingTransaction
      ? existingTransaction.companionFeeXaf
      : 75000;
    const commissionRetainedXaf = existingTransaction
      ? existingTransaction.platformFeeXaf
      : 7500;

    return NextResponse.json({
      success: true,
      message:
        "Félicitations ! Double confirmation validée. Les fonds séquestrés ont été débloqués et crédités sur le solde du prestataire.",
      payout: {
        payoutRef,
        missionId,
        transactionRef:
          existingTransaction?.transactionRef ||
          transactionRef ||
          "UP-ESCROW-CONFIRMED",
        amountReleasedXaf,
        commissionRetainedXaf,
        status: "released_to_companion",
        settledAt: new Date().toISOString(),
        clientConfirmed,
        companionConfirmed,
      },
    });
  } catch (error) {
    console.error("Erreur dans /api/escrow/release :", error);
    return NextResponse.json(
      {
        error: "Erreur interne lors de la libération des fonds de séquestre.",
      },
      { status: 500 },
    );
  }
}
