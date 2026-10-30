const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, "") ||
  "http://127.0.0.1:8000/api";

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
  details?: unknown;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ApiError(
      "Could not reach the MOSAIC API. Check that the backend is running.",
      0,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError(
      `The MOSAIC API returned an unreadable response (HTTP ${response.status}).`,
      response.status,
    );
  }

  if (!response.ok) {
    const envelope = payload as Partial<ApiEnvelope<unknown>>;
    const message =
      typeof envelope.message === "string"
        ? envelope.message
        : `The MOSAIC API returned HTTP ${response.status}.`;
    throw new ApiError(message, response.status);
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("success" in payload) ||
    !("data" in payload)
  ) {
    throw new ApiError("The MOSAIC API returned an unexpected response.", 0);
  }

  const envelope = payload as ApiEnvelope<T>;
  if (!envelope.success || envelope.data === undefined) {
    throw new ApiError(
      envelope.message || "The MOSAIC API request failed.",
      response.status,
    );
  }

  return envelope.data;
}
