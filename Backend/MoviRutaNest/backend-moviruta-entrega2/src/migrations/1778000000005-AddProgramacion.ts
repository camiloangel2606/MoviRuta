import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProgramacion1778000000005 implements MigrationInterface {
  name = 'AddProgramacion1778000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `programacion` (`id` int NOT NULL AUTO_INCREMENT, `fecha` date NOT NULL, `hora_salida` time NOT NULL, `recurrente` enum (\'UNICA\', \'DIARIA\', \'LUNES_A_VIERNES\', \'FINES_DE_SEMANA\') NOT NULL DEFAULT \'UNICA\', `tolerancia_minutos` int NOT NULL DEFAULT 0, `estado` varchar(30) NOT NULL DEFAULT \'PROGRAMADO\', `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `rutaId` int NOT NULL, `busId` int NOT NULL, `conductorId` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'ALTER TABLE `programacion` ADD CONSTRAINT `FK_programacion_ruta` FOREIGN KEY (`rutaId`) REFERENCES `ruta`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `programacion` ADD CONSTRAINT `FK_programacion_bus` FOREIGN KEY (`busId`) REFERENCES `bus`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `programacion` ADD CONSTRAINT `FK_programacion_conductor` FOREIGN KEY (`conductorId`) REFERENCES `conductor`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `programacion` DROP FOREIGN KEY `FK_programacion_conductor`',
    );
    await queryRunner.query(
      'ALTER TABLE `programacion` DROP FOREIGN KEY `FK_programacion_bus`',
    );
    await queryRunner.query(
      'ALTER TABLE `programacion` DROP FOREIGN KEY `FK_programacion_ruta`',
    );
    await queryRunner.query('DROP TABLE `programacion`');
  }
}
