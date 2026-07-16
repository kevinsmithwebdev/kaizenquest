import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import {
  createUserRegisteredEvent,
  KAFKA_TOPICS,
  type SignInInput,
  type SignUpInput,
} from "@kaizen/shared-contracts";
import {
  hashPassword,
  signAuthToken,
  verifyAuthToken,
  verifyPassword,
} from "@kaizen/domain-auth";
import { publishKafkaMessage } from "@kaizen/shared-nestjs";
import { Prisma } from "./generated/prisma/client";

import { PrismaService } from "./prisma.service";

const toAuthUser = (user: {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

@Injectable()
export class AuthService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async signUp(input: SignUpInput) {
    const email = input.email.toLowerCase();
    const passwordHash = await hashPassword(input.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          name: input.name,
          email,
          passwordHash,
        },
      });

      const accessToken = await signAuthToken(user.id);
      const event = createUserRegisteredEvent({
        userId: user.id,
        email: user.email,
        name: user.name,
      });
      await publishKafkaMessage(KAFKA_TOPICS.AUTH_USER_REGISTERED, event);

      return { accessToken, user: toAuthUser(user) };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException(
          "An account with this email already exists.",
        );
      }
      throw error;
    }
  }

  async signIn(input: SignInInput) {
    const email = input.email.toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const accessToken = await signAuthToken(user.id);
    return { accessToken, user: toAuthUser(user) };
  }

  async me(authorizationHeader?: string) {
    const userId = await this.requireUserId(authorizationHeader);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException("User not found.");
    }
    return toAuthUser(user);
  }

  private async requireUserId(authorizationHeader?: string) {
    if (!authorizationHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token.");
    }

    const token = authorizationHeader.slice("Bearer ".length).trim();
    const userId = await verifyAuthToken(token);
    if (!userId) {
      throw new UnauthorizedException("Invalid token.");
    }
    return userId;
  }
}
