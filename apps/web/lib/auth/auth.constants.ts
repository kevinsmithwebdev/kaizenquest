export { MIN_PASSWORD_LENGTH } from "@kaizen/shared-contracts";

export const authUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} as const;
