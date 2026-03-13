export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export async function apiRequest<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<ApiSuccessResponse<T>> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  const json = (await response.json()) as ApiSuccessResponse<T> | ApiErrorResponse;
  if (!response.ok || !json.success) {
    const message =
      "error" in json && json.error?.message ? json.error.message : "Request failed unexpectedly";
    throw new Error(message);
  }

  return json;
}
