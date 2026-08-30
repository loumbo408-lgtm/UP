export type PaymentOperator = "airtel_money" | "moov_money";

export interface EscrowTransactionRecord {
  id: string;
  transactionRef: string;
  missionId: string;
  companionId: string;
  paymentOperator: PaymentOperator;
  phoneNumber: string;
  companionFeeXaf: number;
  platformFeeXaf: number;
  totalAmountXaf: number;
  status: "held" | "released_to_companion" | "refunded_to_client";
  otpCode: string; // 4-digit code (ex: "8492")
  heldAt: string;
  settledAt: string | null;
  ussdPromptSent: boolean;
}

export interface MissionReviewRecord {
  id: string;
  missionId: string;
  authorRole: "client" | "companion";
  rating: number; // 1 to 5
  tags: string[];
  comment: string;
  createdAt: string;
}

// In-memory ledgers for active escrow sessions and mission reviews
export const globalEscrowStore = new Map<string, EscrowTransactionRecord>();
export const globalMissionReviews = new Map<string, MissionReviewRecord[]>();

// Helper to seed a demo mission for testing
if (!globalEscrowStore.has("demo-mission")) {
  globalEscrowStore.set("demo-mission", {
    id: "tx-demo-1",
    transactionRef: "UP-ESCROW-20260830-AIRTEL-DEMO",
    missionId: "demo-mission",
    companionId: "awa-n",
    paymentOperator: "airtel_money",
    phoneNumber: "+241 074 12 34 56",
    companionFeeXaf: 75000,
    platformFeeXaf: 7500,
    totalAmountXaf: 82500,
    status: "held",
    otpCode: "4829",
    heldAt: new Date().toISOString(),
    settledAt: null,
    ussdPromptSent: true,
  });
}
