import { MIN_PASSWORD_LENGTH } from "@kaizen/shared-contracts";

export { MIN_PASSWORD_LENGTH };

export const authUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} as const;
