import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BusService } from './bus.service';
import { Bus } from './entities/bus.entity';
import { Empresa } from '../empresa/entities/empresa.entity';

describe('BusService', () => {
  let service: BusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusService,
        { provide: getRepositoryToken(Bus), useValue: {} },
        { provide: getRepositoryToken(Empresa), useValue: {} },
      ],
    }).compile();

    service = module.get<BusService>(BusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
