import { Test, TestingModule } from '@nestjs/testing';
import { RutaParaderoController } from './ruta-paradero.controller';
import { RutaParaderoService } from './ruta-paradero.service';

describe('RutaParaderoController', () => {
  let controller: RutaParaderoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RutaParaderoController],
      providers: [{ provide: RutaParaderoService, useValue: {} }],
    }).compile();

    controller = module.get<RutaParaderoController>(RutaParaderoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
