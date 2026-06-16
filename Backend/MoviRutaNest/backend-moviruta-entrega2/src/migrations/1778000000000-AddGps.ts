import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGps1778000000000 implements MigrationInterface {
  name = 'AddGps1778000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `gps` (`id` int NOT NULL AUTO_INCREMENT, `device_id` varchar(120) NOT NULL, `latitud` decimal(10,7) NULL, `longitud` decimal(10,7) NULL, `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `busId` int NOT NULL, UNIQUE INDEX `IDX_gps_bus` (`busId`), UNIQUE INDEX `IDX_gps_device_id` (`device_id`), PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'ALTER TABLE `gps` ADD CONSTRAINT `FK_gps_bus` FOREIGN KEY (`busId`) REFERENCES `bus`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `gps` DROP FOREIGN KEY `FK_gps_bus`');
    await queryRunner.query('DROP INDEX `IDX_gps_device_id` ON `gps`');
    await queryRunner.query('DROP INDEX `IDX_gps_bus` ON `gps`');
    await queryRunner.query('DROP TABLE `gps`');
  }
}
