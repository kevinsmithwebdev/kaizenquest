import { Body, Controller, Get, Headers, Inject, Post } from "@nestjs/common";
import { signInSchema, signUpSchema } from "@kaizen/shared-contracts";
import { ZodValidationPipe } from "@kaizen/shared-nestjs";

import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post("sign-up")
  signUp(@Body(new ZodValidationPipe(signUpSchema)) body: unknown) {
    return this.authService.signUp(body as never);
  }

  @Post("sign-in")
  signIn(@Body(new ZodValidationPipe(signInSchema)) body: unknown) {
    return this.authService.signIn(body as never);
  }

  @Get("me")
  me(@Headers("authorization") authorization?: string) {
    return this.authService.me(authorization);
  }
}
