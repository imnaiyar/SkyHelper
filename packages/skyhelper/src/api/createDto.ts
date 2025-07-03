import { ApiProperty } from "@nestjs/swagger";
import { z, ZodObject, ZodOptional } from "zod";

export function createDtoFromZod<T extends ZodObject<any>>(schema: T) {
  class DynamicDto {}

  const shape = schema.shape;

  for (const key in shape) {
    const original = shape[key];
    const def = original instanceof ZodOptional ? original._def.innerType : original;
    const isOptional = original.isOptional?.() ?? false;
    const obj: any = {};

    if (def.isNullable()) obj.nullable = true;

    // ZodString
    if (def instanceof z.ZodString) {
      obj.type = String;
      obj.description = def._def.description || "";
      const checks = def._def.checks || [];
      for (const check of checks) {
        if (check.kind === "min") obj.minLength = check.value;
        if (check.kind === "max") obj.maxLength = check.value;
        if (check.kind === "regex") obj.pattern = check.regex.source;
      }
    }

    // ZodEnum
    else if (def instanceof z.ZodEnum) {
      obj.enum = def._def.values;
      obj.enumName = key;
      obj.type = String;
    }

    // ZodNumber
    else if (def instanceof z.ZodNumber) {
      obj.type = Number;
      const checks = def._def.checks || [];
      for (const check of checks) {
        if (check.kind === "min") obj.minimum = check.value;
        if (check.kind === "max") obj.maximum = check.value;
      }
    }

    // ZodBoolean
    else if (def instanceof z.ZodBoolean) {
      obj.type = Boolean;
    }

    // ZodArray
    else if (def instanceof z.ZodArray) {
      const itemType = def._def.type;
      if (itemType instanceof z.ZodEnum) {
        obj.isArray = true;
        obj.type = [String];
        obj.enum = itemType._def.values;
      } else if (itemType instanceof z.ZodString) {
        obj.isArray = true;
        obj.type = [String];
      } else if (itemType instanceof z.ZodNumber) {
        obj.isArray = true;
        obj.type = [Number];
      } else {
        obj.isArray = true;
        obj.type = [Object]; // fallback or support nested DTOs later
      }
    }

    // ZodObject (nested)
    else if (def instanceof z.ZodObject) {
      // Recursively convert nested object to class
      const nestedClass = createDtoFromZod(def);
      obj.type = nestedClass;
    }

    // default
    else {
      obj.type = String; //
    }
    if (isOptional) obj.required = false;

    Object.defineProperty(DynamicDto.prototype, key, {
      configurable: true,
      enumerable: true,
      writable: true,
    });
    ApiProperty(obj)(DynamicDto.prototype, key);
  }

  return DynamicDto;
}
