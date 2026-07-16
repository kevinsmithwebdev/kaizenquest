/**
 * React Native / Expo app shell.
 * Uses the same gateway + @kaizen/shared-api-client as web for portable auth/goals.
 *
 * Next steps when starting mobile for real:
 * 1. `npx create-expo-app` into this folder (or replace with Expo Router)
 * 2. Store JWT in expo-secure-store
 * 3. createApiClient({ baseUrl: API_GATEWAY_URL, getAccessToken: () => secureStore.get(...) })
 */
import { createApiClient } from "@kaizen/shared-api-client";

export const createMobileApiClient = (accessToken: string | null) =>
  createApiClient({
    baseUrl: process.env.EXPO_PUBLIC_API_GATEWAY_URL ?? "http://localhost:3003",
    getAccessToken: () => accessToken,
  });

export const mobileAppInfo = {
  name: "Kaizen Quest",
  platform: "react-native",
} as const;
