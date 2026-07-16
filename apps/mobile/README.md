# Mobile (React Native)

Placeholder Nx app for a future Expo/React Native client.

It already depends on `@kaizen/shared-api-client` and `@kaizen/shared-contracts`, so mobile can talk to the same NestJS API gateway as the web app (`Authorization: Bearer <jwt>`).

## Bootstrap Expo later

```bash
# from repo root — replace or extend apps/mobile with Expo
npx create-expo-app@latest apps/mobile-tmp
```

Then wire Secure Store for JWT and point `EXPO_PUBLIC_API_GATEWAY_URL` at the gateway.
