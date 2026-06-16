import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIncidenteFoto1778000000003 implements MigrationInterface {
  name = 'AddIncidenteFoto1778000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `incidente` (`id` int NOT NULL AUTO_INCREMENT, `tipo` enum (\'MECANICO\', \'ACCIDENTE\', \'ELECTRICO\', \'OTRO\') NOT NULL, `gravedad` enum (\'BAJA\', \'MEDIA\', \'ALTA\', \'CRITICA\') NOT NULL, `descripcion` varchar(500) NOT NULL, `estado` enum (\'PENDIENTE\', \'EN_PROCESO\', \'RESUELTO\') NOT NULL DEFAULT \'PENDIENTE\', `latitud` decimal(10,7) NULL, `longitud` decimal(10,7) NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `busId` int NOT NULL, `reportadoPorId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'CREATE TABLE `foto` (`id` int NOT NULL AUTO_INCREMENT, `url` varchar(400) NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `incidenteId` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'CREATE TABLE `incidente_bus` (`id` int NOT NULL AUTO_INCREMENT, `busId` int NOT NULL, `incidenteId` int NOT NULL, UNIQUE INDEX `IDX_incidente_bus_unique` (`busId`, `incidenteId`), PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'ALTER TABLE `incidente` ADD CONSTRAINT `FK_incidente_bus` FOREIGN KEY (`busId`) REFERENCES `bus`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `incidente` ADD CONSTRAINT `FK_incidente_reportado_por` FOREIGN KEY (`reportadoPorId`) REFERENCES `persona`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `foto` ADD CONSTRAINT `FK_foto_incidente` FOREIGN KEY (`incidenteId`) REFERENCES `incidente`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `incidente_bus` ADD CONSTRAINT `FK_incidente_bus_bus` FOREIGN KEY (`busId`) REFERENCES `bus`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `incidente_bus` ADD CONSTRAINT `FK_incidente_bus_incidente` FOREIGN KEY (`incidenteId`) REFERENCES `incidente`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `incidente_bus` DROP FOREIGN KEY `FK_incidente_bus_incidente`');
    await queryRunner.query('ALTER TABLE `incidente_bus` DROP FOREIGN KEY `FK_incidente_bus_bus`');
    await queryRunner.query('ALTER TABLE `foto` DROP FOREIGN KEY `FK_foto_incidente`');
    await queryRunner.query('ALTER TABLE `incidente` DROP FOREIGN KEY `FK_incidente_reportado_por`');
    await queryRunner.query('ALTER TABLE `incidente` DROP FOREIGN KEY `FK_incidente_bus`');
    await queryRunner.query('DROP INDEX `IDX_incidente_bus_unique` ON `incidente_bus`');
    await queryRunner.query('DROP TABLE `incidente_bus`');
    await queryRunner.query('DROP TABLE `foto`');
    await queryRunner.query('DROP TABLE `incidente`');
  }
}
