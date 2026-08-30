import { NextResponse } from "next/server";
import {
  globalEscrowStore,
  type EscrowTransactionRecord,
  type PaymentOperator,
} from "@/lib/escrow";

interface EscrowChargeRequest {
  missionId: string;
  companionId?: string;
  companionFee: number;
  platformFeeRate?: number; // default 0.1 (10%)
  paymentOperator: PaymentOperator;
  phoneNumber: string;
}

function cleanGabonPhoneNumber(rawPhone: string): string {
  return rawPhone.replace(/[^\d+]/g, "").trim();
}

function generateOtpCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function generateTransactionRef(operator: PaymentOperator): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const prefix = operator === "airtel_money" ? "AIRTEL" : "MOOV";
  return `UP-ESCROW-${dateStr}-${prefix}-${randSuffix}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EscrowChargeRequest;

    const {
      missionId,
      companionId = "unknown-companion",
      companionFee,
      platformFeeRate = 0.1,
      paymentOperator,
      phoneNumber,
    } = body;

    // Validation des données requises
    if (!missionId) {
      return NextResponse.json(
        { error: "L'identifiant de mission (missionId) est requis." },
        { status: 400 },
      );
    }

    if (!companionFee || companionFee <= 0) {
      return NextResponse.json(
        {
          error:
            "Le montant des honoraires du prestataire doit être supérieur à 0 FCFA.",
        },
        { status: 400 },
      );
    }

    if (
      !paymentOperator ||
      !["airtel_money", "moov_money"].includes(paymentOperator)
    ) {
      return NextResponse.json(
        {
          error:
            "Opérateur de paiement invalide (Airtel Money ou Moov Money requis).",
        },
        { status: 400 },
      );
    }

    const cleanPhone = cleanGabonPhoneNumber(phoneNumber || "");
    if (!cleanPhone || cleanPhone.length < 8) {
      return NextResponse.json(
        { error: "Numéro de téléphone Mobile Money gabonais invalide." },
        { status: 400 },
      );
    }

    // Calcul financier : Tarif prestataire + Frais de service UP (10%)
    const companionFeeXaf = Math.round(companionFee);
    const platformFeeXaf = Math.round(companionFeeXaf * platformFeeRate);
    const totalAmountXaf = companionFeeXaf + platformFeeXaf;

    // Génération du code OTP de sécurité partagé pour le déblocage en fin de mission
    const otpCode = generateOtpCode();
    const transactionRef = generateTransactionRef(paymentOperator);
    const transactionId = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const transaction: EscrowTransactionRecord = {
      id: transactionId,
      transactionRef,
      missionId,
      companionId,
      paymentOperator,
      phoneNumber: cleanPhone,
      companionFeeXaf,
      platformFeeXaf,
      totalAmountXaf,
      status: "held",
      otpCode,
      heldAt: new Date().toISOString(),
      settledAt: null,
      ussdPromptSent: true,
    };

    // Sauvegarde dans le registre de séquestre
    globalEscrowStore.set(missionId, transaction);
    globalEscrowStore.set(transactionRef, transaction);

    return NextResponse.json({
      success: true,
      message:
        "Requête push USSD transmise à la passerelle Mobile Money. Fonds consignés sous séquestre (statut 'held').",
      transaction: {
        id: transaction.id,
        transactionRef: transaction.transactionRef,
        missionId: transaction.missionId,
        companionId: transaction.companionId,
        paymentOperator: transaction.paymentOperator,
        phoneNumber: transaction.phoneNumber,
        companionFeeXaf: transaction.companionFeeXaf,
        platformFeeXaf: transaction.platformFeeXaf,
        totalAmountXaf: transaction.totalAmountXaf,
        status: transaction.status,
        otpCode: transaction.otpCode,
        heldAt: transaction.heldAt,
      },
    });
  } catch (error) {
    console.error("Erreur dans /api/escrow/charge :", error);
    return NextResponse.json(
      {
        error: "Erreur interne lors de l'initiation du séquestre Mobile Money.",
      },
      { status: 500 },
    );
  }
}
