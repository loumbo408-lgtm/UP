import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Vérifié la signature HMAC-SHA256 d'un callback opérateur.
 * La comparaison’est à temps constant : une comparaison naive laisserait
 * fuiter la signature attendue octet par octet.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader) return false;

  const provided = signatureHeader.replace(/^sha256=/, '').trim();
  const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');

  const providedBuffer = Buffer.from(provided, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  if (providedBuffer.length !== expectedBuffer.length) return false;

  return timingSafeEqual(providedBuffer, expectedBuffer);
}
