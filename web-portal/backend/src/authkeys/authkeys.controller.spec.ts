import { Test, TestingModule } from '@nestjs/testing';
import { AuthkeysController } from './authkeys.controller';

describe('AuthkeysController', () => {
  let controller: AuthkeysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthkeysController],
    }).compile();

    controller = module.get<AuthkeysController>(AuthkeysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
