import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RutaParaderoService } from './ruta-paradero.service';
import { RutaParadero } from './entities/ruta-paradero.entity';
import { Ruta } from '../ruta/entities/ruta.entity';
import { Paradero } from '../paradero/entities/paradero.entity';

describe('RutaParaderoService', () => {
  let service: RutaParaderoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RutaParaderoService,
        { provide: getRepositoryToken(RutaParadero), useValue: {} },
        { provide: getRepositoryToken(Ruta), useValue: {} },
        { provide: getRepositoryToken(Paradero), useValue: {} },
      ],
    }).compile();

    service = module.get<RutaParaderoService>(RutaParaderoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
