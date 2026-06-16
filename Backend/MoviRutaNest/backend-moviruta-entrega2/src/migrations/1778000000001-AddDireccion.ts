import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDireccion1778000000001 implements MigrationInterface {
  name = 'AddDireccion1778000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `direccion` (`id` int NOT NULL AUTO_INCREMENT, `linea_1` varchar(200) NOT NULL, `linea_2` varchar(200) NULL, `ciudad` varchar(120) NOT NULL, `departamento` varchar(120) NOT NULL, `codigo_postal` varchar(20) NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `ciudadanoId` int NOT NULL, UNIQUE INDEX `IDX_direccion_ciudadano` (`ciudadanoId`), PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'ALTER TABLE `direccion` ADD CONSTRAINT `FK_direccion_ciudadano` FOREIGN KEY (`ciudadanoId`) REFERENCES `ciudadano`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `direccion` DROP FOREIGN KEY `FK_direccion_ciudadano`');
    await queryRunner.query('DROP INDEX `IDX_direccion_ciudadano` ON `direccion`');
    await queryRunner.query('DROP TABLE `direccion`');
  }
}
