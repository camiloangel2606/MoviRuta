import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ParaderoService } from './paradero.service';
import { Paradero } from './entities/paradero.entity';

describe('ParaderoService', () => {
  let service: ParaderoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParaderoService,
        { provide: getRepositoryToken(Paradero), useValue: {} },
      ],
    }).compile();

    service = module.get<ParaderoService>(ParaderoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
