import { Body, Controller, Get, Post } from "@nestjs/common";
import { ZodValidator } from "../pipes/zod-validator.pipe.js";
import { z } from "zod";
const TestSchema = z.object({
  name: z.string(),
  value: z.string(),
  icon: z.string().optional(),
});

type Test = z.infer<typeof TestSchema>;
@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return "Hello World!";
  }

  @Post("/test")
  async test(@Body(new ZodValidator(TestSchema)) _body: Test): Promise<string> {
    return "Success";
  }
}
