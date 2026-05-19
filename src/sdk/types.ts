export type PaymentStatus =
  | "pending"
  | "processing"
  | "success"
  | "failed"
  | "cancelled";

export interface PaymentRequest {
  amount: number;
  currency: "NGN";
  description: string;
  reference?: string;
  merchantId?: string;
}

export interface PaymentSession {
  sessionId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  description: string;
  reference: string;
  createdAt: string;
}

export interface PaymentStatusResponse {
  sessionId: string;
  status: PaymentStatus;
  failureReason?: string;
  completedAt?: string;
  cardLast4?: string;
  cardBrand?: string;
}

export interface TransactionRecord {
  id: string;
  sessionId: string;
  amount: number;
  currency: string;
  description: string;
  status: PaymentStatus;
  reference: string;
  cardLast4?: string;
  cardBrand?: string;
  createdAt: string;
}

export interface EgoPayConfig {
  apiKey: string;
  terminalId: string;
  baseUrl?: string;
  environment?: "sandbox" | "production";
}
