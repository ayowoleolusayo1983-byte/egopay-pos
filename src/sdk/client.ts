import { EgoPayConfig } from "./types";

const DEFAULT_BASE_URL_SANDBOX = "https://sandbox-api.egopay.ng/v1";
const DEFAULT_BASE_URL_PRODUCTION = "https://api.egopay.ng/v1";

export class EgoPayClient {
  private baseUrl: string;
  private apiKey: string;
  private terminalId: string;

  constructor(config: EgoPayConfig) {
    this.apiKey = config.apiKey;
    this.terminalId = config.terminalId;

    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    } else {
      this.baseUrl =
        config.environment === "production"
          ? DEFAULT_BASE_URL_PRODUCTION
          : DEFAULT_BASE_URL_SANDBOX;
    }
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "X-Terminal-ID": this.terminalId,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        (error as { message?: string }).message ||
          `EgoPay API error: ${response.status}`
      );
    }

    return response.json() as Promise<T>;
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>("DELETE", path);
  }
}
