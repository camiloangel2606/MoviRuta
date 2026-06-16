import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RutaService } from './ruta.service';
import { Ruta } from './entities/ruta.entity';
import { RutaParadero } from '../ruta-paradero/entities/ruta-paradero.entity';
import { Paradero } from '../paradero/entities/paradero.entity';

describe('RutaService', () => {
  let service: RutaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RutaService,
        { provide: getRepositoryToken(Ruta), useValue: {} },
        { provide: getRepositoryToken(RutaParadero), useValue: {} },
        { provide: getRepositoryToken(Paradero), useValue: {} },
      ],
    }).compile();

    service = module.get<RutaService>(RutaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
