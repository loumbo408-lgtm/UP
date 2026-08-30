/**
 * Types applicatifs alignes sur les migrations Supabase (supabase/migrations).
 * A regenerer avec `supabase gen types typescript` quand le schema evolue.
 */

export type AppRole = 'client' | 'companion' | 'admin';

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'released'
  | 'cancelled'
  | 'refunded'
  | 'disputed';

export type EscrowStatus = 'held' | 'released' | 'refunded' | 'disputed';

export type PaymentProvider = 'airtel_money' | 'moov_money';

export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';

export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed';

export type VenueCategory =
  | 'restaurant'
  | 'salon'
  | 'événement'
  | 'hotel_lounge'
  | 'cafe'
  | 'culture';

export interface Profile {
  id: string;
  role: AppRole;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  city: string;
  is_active: boolean;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanionProfile {
  id: string;
  display_name: string;
  headline: string | null;
  bio: string | null;
  languages: string[];
  interests: string[];
  hourly_rate_xaf: number;
  photos: string[];
  verification_status: VerificationStatus;
  verified_at: string | null;
  id_document_path: string | null;
  rating_avg: number;
  rating_count: number;
  missions_completed: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Venue {
  id: string;
  name: string;
  category: VenueCategory;
  address: string;
  district: string | null;
  city: string;
  latitude: number | null;
  longitude: number | null;
  photo_url: string | null;
  is_public: boolean;
  is_approved: boolean;
  created_by: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  reference: string;
  client_id: string;
  companion_id: string;
  venue_id: string;
  status: BookingStatus;
  starts_at: string;
  duration_hours: number;
  hourly_rate_xaf: number;
  subtotal_xaf: number;
  service_fee_xaf: number;
  total_xaf: number;
  client_note: string | null;
  cancel_reason: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EscrowTransaction {
  id: string;
  booking_id: string;
  amount_xaf: number;
  platform_fee_xaf: number;
  companion_payout_xaf: number;
  status: EscrowStatus;
  held_at: string;
  released_at: string | null;
  refunded_at: string | null;
  released_by: string | null;
  notes: string | null;
}

export interface Payment {
  id: string;
  booking_id: string;
  payer_id: string;
  provider: PaymentProvider;
  msisdn: string;
  amount_xaf: number;
  status: PaymentStatus;
  provider_reference: string | null;
  idempotency_key: string;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payout {
  id: string;
  escrow_id: string;
  companion_id: string;
  provider: PaymentProvider;
  msisdn: string;
  amount_xaf: number;
  status: PayoutStatus;
  provider_reference: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  author_id: string;
  target_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

/** Reservation jointe à ses relations, telle que la renvoient les requetes de liste. */
export interface BookingWithRelations extends Booking {
  venue: Pick<Venue, 'id' | 'name' | 'category' | 'address' | 'district' | 'city'> | null;
  companion: Pick<CompanionProfile, 'id' | 'display_name' | 'photos' | 'rating_avg'> | null;
  client: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null;
  escrow: Pick<EscrowTransaction, 'id' | 'status' | 'amount_xaf' | 'companion_payout_xaf'> | null;
}
