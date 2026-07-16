import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from "@nestjs/common";
import type { ZodType } from "zod";

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Invalid input";
      throw new BadRequestException(message);
    }
    return result.data;
  }
}
