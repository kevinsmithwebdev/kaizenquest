import bcrypt from "bcryptjs";

import { SALT_ROUNDS } from "./password.constants";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}
