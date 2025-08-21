import { type PipeTransform, Injectable, type ArgumentMetadata, BadRequestException } from "@nestjs/common";
import { ZodType } from "zod/v4";

@Injectable()
export class ZodValidator implements PipeTransform {
  constructor(
    private readonly schema: ZodType,
    private readonly message?: string,
  ) {}

  transform(value: any, _metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({ message: this.message ?? "Bad Request", errors: result.error.issues });
    }

    return result.data;
  }
}
