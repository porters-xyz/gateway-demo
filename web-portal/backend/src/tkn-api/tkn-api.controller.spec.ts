import { Test, TestingModule } from '@nestjs/testing';
import { TknApiController } from './tkn-api.controller';

describe('TknApiController', () => {
  let controller: TknApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TknApiController],
    }).compile();

    controller = module.get<TknApiController>(TknApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
