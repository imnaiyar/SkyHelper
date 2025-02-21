import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller.js";

// Not actually implemented
describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const client = {};
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: "BotClient", useValue: client }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("root", () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe("Hello World!");
    });
  });
});
