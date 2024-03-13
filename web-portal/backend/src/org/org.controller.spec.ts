import { Test, TestingModule } from '@nestjs/testing';
import { OrgController } from './org.controller';

describe('OrgController', () => {
  let controller: OrgController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrgController],
    }).compile();

    controller = module.get<OrgController>(OrgController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
