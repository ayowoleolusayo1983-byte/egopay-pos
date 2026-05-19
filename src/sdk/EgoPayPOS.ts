import { EgoPayClient } from "./client";
import {
  EgoPayConfig,
  PaymentRequest,
  PaymentSession,
  PaymentStatus,
  PaymentStatusResponse,
} from "./types";

export class EgoPayPOS {
  private client: EgoPayClient;
  private config: EgoPayConfig;

  constructor(config: EgoPayConfig) {
    this.config = config;
    this.client = new EgoPayClient(config);
  }

  /**
   * Initiates a new payment session on the POS terminal.
   * Returns a session object. Poll checkStatus() until status is
   * 'success', 'failed', or 'cancelled'.
   */
  async initiatePayment(request: PaymentRequest): Promise<PaymentSession> {
    return this.client.post<PaymentSession>("/pos/sessions", {
      ...request,
      terminalId: this.config.terminalId,
    });
  }

  /**
   * Polls the status of an ongoing payment session.
   */
  async checkStatus(sessionId: string): Promise<PaymentStatusResponse> {
    return this.client.get<PaymentStatusResponse>(
      `/pos/sessions/${sessionId}/status`
    );
  }

  /**
   * Cancels an active payment session.
   */
  async cancelPayment(sessionId: string): Promise<void> {
    await this.client.delete<void>(`/pos/sessions/${sessionId}`);
  }

  /**
   * Convenience helper: polls until terminal status until a final state
   * is reached or the timeout expires.
   *
   * @param sessionId - The session to poll
   * @param onStatusChange - Optional callback fired on each poll
   * @param intervalMs - Poll interval (default 2000ms)
   * @param timeoutMs - Max wait time (default 120000ms / 2 min)
   */
  async waitForPayment(
    sessionId: string,
    onStatusChange?: (status: PaymentStatus) => void,
    intervalMs = 2000,
    timeoutMs = 120_000
  ): Promise<PaymentStatusResponse> {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      const response = await this.checkStatus(sessionId);
      onStatusChange?.(response.status);

      if (
        response.status === "success" ||
        response.status === "failed" ||
        response.status === "cancelled"
      ) {
        return response;
      }

      await new Promise<void>((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error("Payment timed out. Please try again.");
  }
}

let _instance: EgoPayPOS | null = null;

/**
 * Returns a singleton EgoPayPOS instance.
 * Configure via EXPO_PUBLIC_EGOPAY_API_KEY and EXPO_PUBLIC_EGOPAY_TERMINAL_ID.
 */
export function getEgoPayPOS(): EgoPayPOS {
  if (!_instance) {
    const apiKey = process.env.EXPO_PUBLIC_EGOPAY_API_KEY ?? "";
    const terminalId = process.env.EXPO_PUBLIC_EGOPAY_TERMINAL_ID ?? "";
    const environment =
      process.env.EXPO_PUBLIC_EGOPAY_ENV === "production"
        ? "production"
        : "sandbox";

    _instance = new EgoPayPOS({ apiKey, terminalId, environment });
  }
  return _instance;
}
