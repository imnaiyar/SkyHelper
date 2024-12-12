import { type PipeTransform, Injectable, type ArgumentMetadata, BadRequestException } from "@nestjs/common";
import { ZodSchema } from "zod";

@Injectable()
export class ZodValidator implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(
        { message: "Bad Request: Invalid body", errors: result.error.issues },
        "Provided body is invalid",
      );
    }

    return result.data;
  }
}

