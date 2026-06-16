import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmpresaService } from './empresa.service';
import { Empresa } from './entities/empresa.entity';

describe('EmpresaService', () => {
  let service: EmpresaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpresaService,
        { provide: getRepositoryToken(Empresa), useValue: {} },
      ],
    }).compile();

    service = module.get<EmpresaService>(EmpresaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
