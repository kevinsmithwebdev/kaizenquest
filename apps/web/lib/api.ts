import { createApiClient } from "@kaizen/shared-api-client";

import { getAuthTokenFromCookie } from "@/lib/auth/get-auth-token-from-cookie";

export const getApiGatewayUrl = () =>
  process.env.API_GATEWAY_URL ?? "http://localhost:3003";

export const createServerApiClient = () =>
  createApiClient({
    baseUrl: getApiGatewayUrl(),
    getAccessToken: async () => (await getAuthTokenFromCookie()) ?? null,
  });
