import { Test, TestingModule } from '@nestjs/testing';
import { AuthkeysService } from './authkeys.service';

describe('AuthkeysService', () => {
  let service: AuthkeysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthkeysService],
    }).compile();

    service = module.get<AuthkeysService>(AuthkeysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
