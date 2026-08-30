import type { PaymentProvider } from '@/types/database';

/**
 * Adaptateur passerelle Mobile Money (Airtel Money / Moov Money).
 *
 * Les deux opérateurs suivent le même schema : on pousse une demande de
 * paiement (USSD push) vers le téléphone du client, l'opérateur repond avec
 * une reference, puis notifie l'issue de facon asynchrone sur notre webhook.
 * Le montant n'est donc JAMAIS considere comme encaisse a l'aller : seul le
 * callback signe declenche la mise sous séquestre.
 */

export interface CollectionRequest {
  provider: PaymentProvider;
  msisdn: string;
  amountXaf: number;
  /** Reference interne UP (reference de mission), visible sur le releve client. */
  externalId: string;
  /** Cle d'idempotence : un rejeu ne débité pas deux fois. */
  idempotencyKey: string;
  description: string;
}

export interface CollectionResult {
  accepted: boolean;
  providerReference: string | null;
  failureReason?: string;
}

export interface DisbursementRequest {
  provider: PaymentProvider;
  msisdn: string;
  amountXaf: number;
  externalId: string;
  description: string;
}

interface ProviderConfig {
  baseUrl: string;
  apiKey: string;
}

function readConfig(provider: PaymentProvider): ProviderConfig | null {
  const prefix = provider === 'airtel_money' ? 'AIRTEL' : 'MOOV';
  const baseUrl = process.env[`${prefix}_MONEY_BASE_URL`];
  const apiKey = process.env[`${prefix}_MONEY_API_KEY`];
  if (!baseUrl || !apiKey) return null;
  return { baseUrl, apiKey };
}

/** Le mode simulation permet de derouler tout le parcours sans compte opérateur. */
export function isSandbox(provider: PaymentProvider): boolean {
  return readConfig(provider) === null;
}

/**
 * Declenche la demande de paiement. En sandbox, on renvoie une reference
 * simulee et c'est l'appel manuel du webhook (ou le bouton de test) qui
 * confirme le paiement — le flux reste identique à la production.
 */
export async function requestCollection(req: CollectionRequest): Promise<CollectionResult> {
  const config = readConfig(req.provider);

  if (!config) {
    return { accepted: true, providerReference: `SANDBOX-${req.idempotencyKey.slice(0, 12)}` };
  }

  try {
    const response = await fetch(`${config.baseUrl}/collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
        'X-Idempotency-Key': req.idempotencyKey,
      },
      body: JSON.stringify({
        msisdn: req.msisdn,
        amount: req.amountXaf,
        currency: 'XAF',
        external_id: req.externalId,
        description: req.description,
      }),
      cache: 'no-store',
    });

    const payload = (await response.json().catch(() => ({}))) as {
      reference?: string;
      message?: string;
    };

    if (!response.ok) {
      return {
        accepted: false,
        providerReference: null,
        failureReason: payload.message ?? `Opérateur indisponible (${response.status})`,
      };
    }

    return { accepted: true, providerReference: payload.reference ?? null };
  } catch (error) {
    return {
      accepted: false,
      providerReference: null,
      failureReason: error instanceof Error ? error.message : 'Erreur réseau opérateur',
    };
  }
}

/** Reversement vers le companion, après libération du séquestre. */
export async function requestDisbursement(
  req: DisbursementRequest,
): Promise<CollectionResult> {
  const config = readConfig(req.provider);

  if (!config) {
    return { accepted: true, providerReference: `SANDBOX-PAYOUT-${req.externalId.slice(0, 12)}` };
  }

  try {
    const response = await fetch(`${config.baseUrl}/disbursements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        msisdn: req.msisdn,
        amount: req.amountXaf,
        currency: 'XAF',
        external_id: req.externalId,
        description: req.description,
      }),
      cache: 'no-store',
    });

    const payload = (await response.json().catch(() => ({}))) as {
      reference?: string;
      message?: string;
    };

    if (!response.ok) {
      return {
        accepted: false,
        providerReference: null,
        failureReason: payload.message ?? `Reversement refuse (${response.status})`,
      };
    }

    return { accepted: true, providerReference: payload.reference ?? null };
  } catch (error) {
    return {
      accepted: false,
      providerReference: null,
      failureReason: error instanceof Error ? error.message : 'Erreur réseau opérateur',
    };
  }
}
