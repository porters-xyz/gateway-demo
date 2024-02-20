import { Test, TestingModule } from '@nestjs/testing';
import { SiweController } from './siwe.controller';

describe('SiweController', () => {
  let controller: SiweController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SiweController],
    }).compile();

    controller = module.get<SiweController>(SiweController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
