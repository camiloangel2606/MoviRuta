import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMetodoPago1778000000002 implements MigrationInterface {
  name = 'AddMetodoPago1778000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `metodo_pago` (`id` int NOT NULL AUTO_INCREMENT, `nombre` varchar(120) NOT NULL, `tipo` enum (\'TARJETA\', \'EFECTIVO\', \'TRANSFERENCIA\') NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX `IDX_metodo_pago_nombre` (`nombre`), PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'CREATE TABLE `metodo_pago_ciudadano` (`id` int NOT NULL AUTO_INCREMENT, `identificador` varchar(120) NOT NULL, `saldo` decimal(10,2) NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `ciudadanoId` int NOT NULL, `metodoPagoId` int NOT NULL, UNIQUE INDEX `IDX_metodo_pago_ciudadano_identificador` (`ciudadanoId`, `metodoPagoId`, `identificador`), PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'ALTER TABLE `metodo_pago_ciudadano` ADD CONSTRAINT `FK_metodo_pago_ciudadano_ciudadano` FOREIGN KEY (`ciudadanoId`) REFERENCES `ciudadano`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `metodo_pago_ciudadano` ADD CONSTRAINT `FK_metodo_pago_ciudadano_metodo_pago` FOREIGN KEY (`metodoPagoId`) REFERENCES `metodo_pago`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `metodo_pago_ciudadano` DROP FOREIGN KEY `FK_metodo_pago_ciudadano_metodo_pago`');
    await queryRunner.query('ALTER TABLE `metodo_pago_ciudadano` DROP FOREIGN KEY `FK_metodo_pago_ciudadano_ciudadano`');
    await queryRunner.query('DROP INDEX `IDX_metodo_pago_ciudadano_identificador` ON `metodo_pago_ciudadano`');
    await queryRunner.query('DROP TABLE `metodo_pago_ciudadano`');
    await queryRunner.query('DROP INDEX `IDX_metodo_pago_nombre` ON `metodo_pago`');
    await queryRunner.query('DROP TABLE `metodo_pago`');
  }
}
