CREATE DATABASE  IF NOT EXISTS `moviruta_entrega2` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `moviruta_entrega2`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: moviruta_entrega2
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `boleto`
--

DROP TABLE IF EXISTS `boleto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `boleto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `estado` enum('ACTIVO','COMPLETADO','CANCELADO') NOT NULL DEFAULT 'ACTIVO',
  `costo` decimal(10,2) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `ciudadanoId` int NOT NULL,
  `hora_fin` datetime DEFAULT NULL,
  `programacionId` int NOT NULL,
  `rutaParaderoOrigenId` int NOT NULL,
  `rutaParaderoDescensoId` int DEFAULT NULL,
  `metodoPagoCiudadanoId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_ac2317d6d409e6611e0801cbf4f` (`ciudadanoId`),
  KEY `FK_51f682f3e80f6067293a84d13bd` (`rutaParaderoDescensoId`),
  KEY `FK_f85cfc95ebc1cf4bde6ff7444db` (`programacionId`),
  KEY `FK_e0fff402958edef00f70ae465de` (`rutaParaderoOrigenId`),
  KEY `FK_7d49f434c7b73eab7caecf4b374` (`metodoPagoCiudadanoId`),
  CONSTRAINT `FK_51f682f3e80f6067293a84d13bd` FOREIGN KEY (`rutaParaderoDescensoId`) REFERENCES `ruta_paradero` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_7d49f434c7b73eab7caecf4b374` FOREIGN KEY (`metodoPagoCiudadanoId`) REFERENCES `metodo_pago_ciudadano` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_ac2317d6d409e6611e0801cbf4f` FOREIGN KEY (`ciudadanoId`) REFERENCES `ciudadano` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_e0fff402958edef00f70ae465de` FOREIGN KEY (`rutaParaderoOrigenId`) REFERENCES `ruta_paradero` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_f85cfc95ebc1cf4bde6ff7444db` FOREIGN KEY (`programacionId`) REFERENCES `programacion` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `boleto`
--

LOCK TABLES `boleto` WRITE;
/*!40000 ALTER TABLE `boleto` DISABLE KEYS */;
INSERT INTO `boleto` VALUES (1,'ACTIVO',2500.00,'2026-05-24 17:42:07.477415','2026-05-24 17:42:07.477415',5,NULL,3,8,NULL,NULL),(2,'COMPLETADO',2500.00,'2026-05-24 17:43:00.872874','2026-05-24 22:41:41.000000',5,'2026-05-24 22:41:42',3,10,12,NULL),(3,'COMPLETADO',2500.00,'2026-05-24 22:27:36.037059','2026-05-24 22:41:33.000000',5,'2026-05-24 22:41:34',3,8,1,NULL),(4,'COMPLETADO',4500.00,'2026-06-08 17:57:54.812912','2026-06-08 17:58:07.000000',5,'2026-06-08 17:58:08',12,18,19,NULL),(5,'COMPLETADO',4500.00,'2026-06-08 19:32:35.714407','2026-06-08 19:32:43.000000',5,'2026-06-08 19:32:43',12,17,19,1),(6,'COMPLETADO',4500.00,'2026-06-09 11:25:32.965652','2026-06-09 11:25:58.000000',5,'2026-06-09 11:25:59',12,17,18,1),(7,'COMPLETADO',4500.00,'2026-06-09 11:31:00.635828','2026-06-09 11:31:08.000000',5,'2026-06-09 11:31:08',12,17,19,1),(8,'COMPLETADO',4500.00,'2026-06-11 08:07:01.315982','2026-06-11 08:07:08.000000',6,'2026-06-11 08:07:08',12,18,19,4);
/*!40000 ALTER TABLE `boleto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bus`
--

DROP TABLE IF EXISTS `bus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bus` (
  `id` int NOT NULL AUTO_INCREMENT,
  `placa` varchar(10) NOT NULL,
  `modelo` varchar(60) NOT NULL,
  `anio` int NOT NULL,
  `capacidad_maxima` int NOT NULL,
  `estado` enum('OPERATIVO','MANTENIMIENTO','FUERA_SERVICIO') NOT NULL DEFAULT 'OPERATIVO',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `empresaId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_fb7ea3a64d22d5276573f22dbd` (`placa`),
  KEY `FK_c4faa91c10668bcc2280faf2269` (`empresaId`),
  CONSTRAINT `FK_c4faa91c10668bcc2280faf2269` FOREIGN KEY (`empresaId`) REFERENCES `empresa` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bus`
--

LOCK TABLES `bus` WRITE;
/*!40000 ALTER TABLE `bus` DISABLE KEYS */;
INSERT INTO `bus` VALUES (1,'ABC123','Volvo 7700',2022,80,'OPERATIVO','2026-04-29 23:04:56.714189','2026-04-29 23:04:56.714189',1),(3,'DEF456','Volvo 7700',2024,80,'OPERATIVO','2026-04-30 11:21:32.641970','2026-04-30 11:21:32.641970',1),(4,'KLM123','Mercedes Citaro',2021,95,'OPERATIVO','2026-04-30 12:04:24.576609','2026-04-30 12:04:24.576609',1),(5,'JFQ','Mercedes Benz',2026,20,'OPERATIVO','2026-06-06 23:46:23.224779','2026-06-07 00:04:28.000000',1);
/*!40000 ALTER TABLE `bus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ciudadano`
--

DROP TABLE IF EXISTS `ciudadano`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ciudadano` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha_nacimiento` date DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `personaId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_f68106fba4ab62191478349ab7` (`personaId`),
  UNIQUE KEY `REL_f68106fba4ab62191478349ab7` (`personaId`),
  CONSTRAINT `FK_f68106fba4ab62191478349ab78` FOREIGN KEY (`personaId`) REFERENCES `persona` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ciudadano`
--

LOCK TABLES `ciudadano` WRITE;
/*!40000 ALTER TABLE `ciudadano` DISABLE KEYS */;
INSERT INTO `ciudadano` VALUES (3,'2000-05-12','2026-04-30 22:11:06.349467','2026-04-30 22:11:06.349467',3),(4,'2000-05-12','2026-04-30 22:11:15.876160','2026-04-30 22:11:15.876160',1),(5,'2006-09-28','2026-05-18 13:56:23.006287','2026-06-09 11:48:42.000000',11),(6,'1959-11-11','2026-06-09 11:16:48.091944','2026-06-11 08:08:13.000000',12);
/*!40000 ALTER TABLE `ciudadano` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conductor`
--

DROP TABLE IF EXISTS `conductor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conductor` (
  `id` int NOT NULL AUTO_INCREMENT,
  `licencia` varchar(50) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `personaId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_a33c172e90e41bf7cd99d1ead8` (`personaId`),
  UNIQUE KEY `REL_a33c172e90e41bf7cd99d1ead8` (`personaId`),
  CONSTRAINT `FK_a33c172e90e41bf7cd99d1ead8c` FOREIGN KEY (`personaId`) REFERENCES `persona` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conductor`
--

LOCK TABLES `conductor` WRITE;
/*!40000 ALTER TABLE `conductor` DISABLE KEYS */;
INSERT INTO `conductor` VALUES (1,'LIC-2026-XYZ','2026-05-02 11:25:55.299008','2026-05-02 11:25:55.299008',3),(2,NULL,'2026-05-18 21:38:26.379683','2026-05-18 21:38:26.379683',11);
/*!40000 ALTER TABLE `conductor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `destinatario_grupo`
--

DROP TABLE IF EXISTS `destinatario_grupo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `destinatario_grupo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mensajeId` int NOT NULL,
  `grupoId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_868bff759f7f3f3669daa82b5b` (`mensajeId`,`grupoId`),
  KEY `FK_8b2148d0975c5f14158b92fac2d` (`grupoId`),
  CONSTRAINT `FK_2169333283c25f621e1659487d6` FOREIGN KEY (`mensajeId`) REFERENCES `mensaje` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_8b2148d0975c5f14158b92fac2d` FOREIGN KEY (`grupoId`) REFERENCES `grupo` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `destinatario_grupo`
--

LOCK TABLES `destinatario_grupo` WRITE;
/*!40000 ALTER TABLE `destinatario_grupo` DISABLE KEYS */;
INSERT INTO `destinatario_grupo` VALUES (1,2,1);
/*!40000 ALTER TABLE `destinatario_grupo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `destinatario_persona`
--

DROP TABLE IF EXISTS `destinatario_persona`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `destinatario_persona` (
  `id` int NOT NULL AUTO_INCREMENT,
  `leido` tinyint NOT NULL DEFAULT '0',
  `mensajeId` int NOT NULL,
  `personaId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_6817e12c9d2a40172d2b1181d1` (`mensajeId`,`personaId`),
  KEY `FK_3c1b19d4e9eb62885999d67c5a8` (`personaId`),
  CONSTRAINT `FK_1875ed2c4aeda7baf22688203ad` FOREIGN KEY (`mensajeId`) REFERENCES `mensaje` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_3c1b19d4e9eb62885999d67c5a8` FOREIGN KEY (`personaId`) REFERENCES `persona` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `destinatario_persona`
--

LOCK TABLES `destinatario_persona` WRITE;
/*!40000 ALTER TABLE `destinatario_persona` DISABLE KEYS */;
INSERT INTO `destinatario_persona` VALUES (1,1,1,2),(2,0,1,3),(3,0,3,2),(4,0,3,3);
/*!40000 ALTER TABLE `destinatario_persona` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `direccion`
--

DROP TABLE IF EXISTS `direccion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `direccion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `linea_1` varchar(200) NOT NULL,
  `linea_2` varchar(200) DEFAULT NULL,
  `ciudad` varchar(120) NOT NULL,
  `departamento` varchar(120) NOT NULL,
  `codigo_postal` varchar(20) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `ciudadanoId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_08a096c8e90b663e25c3accc58` (`ciudadanoId`),
  UNIQUE KEY `REL_08a096c8e90b663e25c3accc58` (`ciudadanoId`),
  CONSTRAINT `FK_08a096c8e90b663e25c3accc584` FOREIGN KEY (`ciudadanoId`) REFERENCES `ciudadano` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `direccion`
--

LOCK TABLES `direccion` WRITE;
/*!40000 ALTER TABLE `direccion` DISABLE KEYS */;
INSERT INTO `direccion` VALUES (1,'Calle 45 # 10-20','Apto 502, Edificio Los Pinos','Manizales','Cundinamarca','110111','2026-05-14 19:07:33.667551',3);
/*!40000 ALTER TABLE `direccion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empresa`
--

DROP TABLE IF EXISTS `empresa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empresa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) NOT NULL,
  `nit` varchar(30) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_51ac4482e14d7afaa64eab9c5a` (`nit`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empresa`
--

LOCK TABLES `empresa` WRITE;
/*!40000 ALTER TABLE `empresa` DISABLE KEYS */;
INSERT INTO `empresa` VALUES (1,'Empresa Demo Editada','900999888-1','2026-04-29 22:56:52.113157','2026-04-30 10:59:32.000000');
/*!40000 ALTER TABLE `empresa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `foto`
--

DROP TABLE IF EXISTS `foto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `foto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `url` varchar(400) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `incidenteId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_be2ea129b6f4acf14e70f39a92f` (`incidenteId`),
  CONSTRAINT `FK_be2ea129b6f4acf14e70f39a92f` FOREIGN KEY (`incidenteId`) REFERENCES `incidente` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `foto`
--

LOCK TABLES `foto` WRITE;
/*!40000 ALTER TABLE `foto` DISABLE KEYS */;
INSERT INTO `foto` VALUES (3,'https://storage.com/imagen1.png','2026-05-15 00:22:04.071754',2),(4,'https://storage.com/imagen2.png','2026-05-15 00:22:04.076896',2);
/*!40000 ALTER TABLE `foto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gps`
--

DROP TABLE IF EXISTS `gps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `device_id` varchar(120) NOT NULL,
  `latitud` decimal(10,7) DEFAULT NULL,
  `longitud` decimal(10,7) DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `busId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_8f55688241c1408e73975f7ffb` (`device_id`),
  UNIQUE KEY `IDX_3ee73b40fa14ab3a700b131318` (`busId`),
  UNIQUE KEY `REL_3ee73b40fa14ab3a700b131318` (`busId`),
  CONSTRAINT `FK_3ee73b40fa14ab3a700b1313189` FOREIGN KEY (`busId`) REFERENCES `bus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gps`
--

LOCK TABLES `gps` WRITE;
/*!40000 ALTER TABLE `gps` DISABLE KEYS */;
INSERT INTO `gps` VALUES (1,'GPS-NUEVO-001',4.6129832,-74.0702731,'2026-05-14 18:35:47.000000',1),(2,'GPS-XYZ789',NULL,NULL,'2026-05-14 18:34:44.353115',3);
/*!40000 ALTER TABLE `gps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grupo`
--

DROP TABLE IF EXISTS `grupo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_46328b39b3ace503a0968d5fc0` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupo`
--

LOCK TABLES `grupo` WRITE;
/*!40000 ALTER TABLE `grupo` DISABLE KEYS */;
INSERT INTO `grupo` VALUES (1,'Pasajeros Ruta Norte','Descripción actualizada','2026-04-30 19:35:56.439878','2026-04-30 19:38:45.000000');
/*!40000 ALTER TABLE `grupo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grupo_persona`
--

DROP TABLE IF EXISTS `grupo_persona`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupo_persona` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rol` enum('MIEMBRO','ADMIN') DEFAULT NULL,
  `fecha_union` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `grupoId` int NOT NULL,
  `personaId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_b439acec7a9c7ff5f9cf9af8da` (`grupoId`,`personaId`),
  KEY `FK_bb8d97c5152ac52e85c55370551` (`personaId`),
  CONSTRAINT `FK_bb8d97c5152ac52e85c55370551` FOREIGN KEY (`personaId`) REFERENCES `persona` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_d74e2af0216f881680972e78613` FOREIGN KEY (`grupoId`) REFERENCES `grupo` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupo_persona`
--

LOCK TABLES `grupo_persona` WRITE;
/*!40000 ALTER TABLE `grupo_persona` DISABLE KEYS */;
INSERT INTO `grupo_persona` VALUES (1,'MIEMBRO','2026-04-30 21:04:35.841678',1,2),(2,'MIEMBRO','2026-05-02 11:48:00.743623',1,3);
/*!40000 ALTER TABLE `grupo_persona` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial`
--

DROP TABLE IF EXISTS `historial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo` enum('ABORDAJE','DESCENSO') NOT NULL,
  `fecha` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `orden` int DEFAULT NULL,
  `boletoId` int NOT NULL,
  `paraderoId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_6b3d920df363da13aea7b2bafb` (`boletoId`,`tipo`),
  KEY `FK_0a899d92cbe8314056c3f77efaa` (`paraderoId`),
  CONSTRAINT `FK_0a899d92cbe8314056c3f77efaa` FOREIGN KEY (`paraderoId`) REFERENCES `paradero` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_f86c8d4c2839dc6b7f02c768b34` FOREIGN KEY (`boletoId`) REFERENCES `boleto` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial`
--

LOCK TABLES `historial` WRITE;
/*!40000 ALTER TABLE `historial` DISABLE KEYS */;
INSERT INTO `historial` VALUES (1,'ABORDAJE','2026-05-02 11:34:02.496076',NULL,2,1),(2,'DESCENSO','2026-05-02 11:36:20.338557',NULL,2,1);
/*!40000 ALTER TABLE `historial` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incidente`
--

DROP TABLE IF EXISTS `incidente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `incidente` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo` enum('MECANICO','ACCIDENTE','ELECTRICO','OTRO') NOT NULL,
  `gravedad` enum('BAJA','MEDIA','ALTA','CRITICA') NOT NULL,
  `descripcion` varchar(500) NOT NULL,
  `estado` enum('PENDIENTE','EN_PROCESO','RESUELTO') NOT NULL DEFAULT 'PENDIENTE',
  `latitud` decimal(10,7) DEFAULT NULL,
  `longitud` decimal(10,7) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `busId` int NOT NULL,
  `reportadoPorId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_1a607125eed02b2c8ec0713e7af` (`busId`),
  KEY `FK_ee3d801deec543c84c49f579d16` (`reportadoPorId`),
  CONSTRAINT `FK_1a607125eed02b2c8ec0713e7af` FOREIGN KEY (`busId`) REFERENCES `bus` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_ee3d801deec543c84c49f579d16` FOREIGN KEY (`reportadoPorId`) REFERENCES `persona` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incidente`
--

LOCK TABLES `incidente` WRITE;
/*!40000 ALTER TABLE `incidente` DISABLE KEYS */;
INSERT INTO `incidente` VALUES (2,'MECANICO','ALTA','Fallo en motor, parada forzada','PENDIENTE',4.6123300,-74.0698700,'2026-05-15 00:22:04.065803',1,3),(3,'MECANICO','CRITICA','Se dañó el motor del bus.','RESUELTO',NULL,NULL,'2026-05-30 19:57:40.324440',3,11),(4,'ACCIDENTE','BAJA','Accidente','RESUELTO',NULL,NULL,'2026-05-30 23:32:01.781046',3,11),(5,'ELECTRICO','MEDIA','falla en las luces','EN_PROCESO',NULL,NULL,'2026-05-30 23:57:05.151234',3,11),(6,'MECANICO','BAJA','Problema mecánico','RESUELTO',5.0534936,-75.4903792,'2026-05-31 00:09:45.896430',3,11),(7,'ACCIDENTE','BAJA','Accidente en la vía','PENDIENTE',5.0534884,-75.4903742,'2026-05-31 00:11:01.763713',3,11);
/*!40000 ALTER TABLE `incidente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incidente_bus`
--

DROP TABLE IF EXISTS `incidente_bus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `incidente_bus` (
  `id` int NOT NULL AUTO_INCREMENT,
  `busId` int NOT NULL,
  `incidenteId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_a1eeb3f41efda6fb7a5d8e7894` (`busId`,`incidenteId`),
  KEY `FK_2c8bb2b8069c50b52865a271d02` (`incidenteId`),
  CONSTRAINT `FK_2c8bb2b8069c50b52865a271d02` FOREIGN KEY (`incidenteId`) REFERENCES `incidente` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_729986ccefa2cd65af754d0a36b` FOREIGN KEY (`busId`) REFERENCES `bus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incidente_bus`
--

LOCK TABLES `incidente_bus` WRITE;
/*!40000 ALTER TABLE `incidente_bus` DISABLE KEYS */;
/*!40000 ALTER TABLE `incidente_bus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mensaje`
--

DROP TABLE IF EXISTS `mensaje`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensaje` (
  `id` int NOT NULL AUTO_INCREMENT,
  `contenido` text NOT NULL,
  `fecha_envio` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `emisorId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_71ebdcdd975d728ccf181b4ec25` (`emisorId`),
  CONSTRAINT `FK_71ebdcdd975d728ccf181b4ec25` FOREIGN KEY (`emisorId`) REFERENCES `persona` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensaje`
--

LOCK TABLES `mensaje` WRITE;
/*!40000 ALTER TABLE `mensaje` DISABLE KEYS */;
INSERT INTO `mensaje` VALUES (1,'Hola, este es un mensaje directo.','2026-04-30 21:26:53.817849',1),(2,'Mensaje para el grupo','2026-04-30 21:35:32.272633',1),(3,'Hola, este es un mensaje directo 2.','2026-04-30 21:40:05.873831',1);
/*!40000 ALTER TABLE `mensaje` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metodo_pago`
--

DROP TABLE IF EXISTS `metodo_pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metodo_pago` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) NOT NULL,
  `tipo` enum('TARJETA','EFECTIVO','TRANSFERENCIA') NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_bbda210e1d462da3bff0746048` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metodo_pago`
--

LOCK TABLES `metodo_pago` WRITE;
/*!40000 ALTER TABLE `metodo_pago` DISABLE KEYS */;
INSERT INTO `metodo_pago` VALUES (1,'Tarjeta Crédito','TARJETA','2026-05-14 20:39:45.972847');
/*!40000 ALTER TABLE `metodo_pago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metodo_pago_ciudadano`
--

DROP TABLE IF EXISTS `metodo_pago_ciudadano`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metodo_pago_ciudadano` (
  `id` int NOT NULL AUTO_INCREMENT,
  `identificador` varchar(120) NOT NULL,
  `saldo` decimal(10,2) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `ciudadanoId` int NOT NULL,
  `metodoPagoId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_fbb69feae0c460968c508b52c1` (`ciudadanoId`,`metodoPagoId`,`identificador`),
  KEY `FK_2209815e71c65fa784d4587b9e1` (`metodoPagoId`),
  CONSTRAINT `FK_2209815e71c65fa784d4587b9e1` FOREIGN KEY (`metodoPagoId`) REFERENCES `metodo_pago` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_f26e77ae03e8b2610d933ea0034` FOREIGN KEY (`ciudadanoId`) REFERENCES `ciudadano` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metodo_pago_ciudadano`
--

LOCK TABLES `metodo_pago_ciudadano` WRITE;
/*!40000 ALTER TABLE `metodo_pago_ciudadano` DISABLE KEYS */;
INSERT INTO `metodo_pago_ciudadano` VALUES (1,'1234-5678-9012-3456',51999.50,'2026-05-14 23:51:30.127124',5,1),(2,'TARJETA-3',0.00,'2026-06-10 22:40:08.981051',3,1),(3,'TARJETA-4',0.00,'2026-06-10 22:40:09.022599',4,1),(4,'TARJETA-6',30500.00,'2026-06-10 22:40:09.040124',6,1);
/*!40000 ALTER TABLE `metodo_pago_ciudadano` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `timestamp` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,1777484288826,'InitSchema1777484288826'),(2,1777591884401,'InitSchema1777591884401'),(3,1777592214926,'InitSchema1777592214926'),(4,1777592572389,'InitSchema1777592572389'),(5,1777592810546,'InitSchema1777592810546'),(6,1777593066012,'InitSchema1777593066012'),(7,1777593353371,'InitSchema1777593353371'),(8,1777595000000,'AddConductorTurno1777595000000'),(9,1777596000000,'AddHistorial1777596000000'),(10,1778000000000,'AddGps1778000000000'),(11,1778000000001,'AddDireccion1778000000001'),(12,1778000000002,'AddMetodoPago1778000000002'),(13,1778000000003,'AddIncidenteFoto1778000000003');
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nodo`
--

DROP TABLE IF EXISTS `nodo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nodo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(140) NOT NULL,
  `latitud` decimal(10,7) NOT NULL,
  `longitud` decimal(10,7) NOT NULL,
  `tipo` enum('PARADERO','INTERSECCION') NOT NULL DEFAULT 'INTERSECCION',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nodo`
--

LOCK TABLES `nodo` WRITE;
/*!40000 ALTER TABLE `nodo` DISABLE KEYS */;
INSERT INTO `nodo` VALUES (1,'Nodo Intersección 1 (editado)',4.7112345,-74.0712345,'INTERSECCION','2026-04-30 22:02:55.053824','2026-04-30 22:05:51.000000');
/*!40000 ALTER TABLE `nodo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paradero`
--

DROP TABLE IF EXISTS `paradero`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paradero` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(140) NOT NULL,
  `latitud` decimal(10,7) NOT NULL,
  `longitud` decimal(10,7) NOT NULL,
  `tipo` enum('PARADERO','ESTACION','TERMINAL') NOT NULL DEFAULT 'PARADERO',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paradero`
--

LOCK TABLES `paradero` WRITE;
/*!40000 ALTER TABLE `paradero` DISABLE KEYS */;
INSERT INTO `paradero` VALUES (1,'Paradero A',4.7109890,-74.0720920,'PARADERO','2026-04-29 23:11:09.848796','2026-04-29 23:11:09.848796'),(3,'Paradero Z',4.7125000,-74.0750000,'PARADERO','2026-04-30 11:48:21.741124','2026-05-19 05:12:34.000000'),(4,'Paradero Centro 1',4.6097100,-74.0817500,'PARADERO','2026-04-30 12:05:34.330101','2026-04-30 12:05:34.330101'),(5,'Paradero Centro Manizales - Cr 22',5.0681500,-75.5172200,'PARADERO','2026-05-19 05:25:04.943453','2026-05-19 05:25:04.943453'),(6,'Paradero El Cable - Frente a Torre de Herveo',5.0592400,-75.4862500,'PARADERO','2026-05-23 18:05:40.239425','2026-05-23 18:05:40.239425'),(7,'Paradero Chipre - Av. Centenario',5.0699200,-75.5255400,'PARADERO','2026-05-23 18:12:07.680562','2026-05-23 18:12:07.680562'),(8,'Paradero Zona Rosa Milán',5.0558100,-75.4748800,'PARADERO','2026-05-23 18:12:49.219805','2026-05-23 18:12:49.219805'),(9,'Paradero Terminal Enea - Frente a Universidad',5.0298500,-75.4501200,'PARADERO','2026-05-23 18:13:25.539345','2026-05-23 18:13:25.539345'),(10,'Paradero Barrio Palermo - Calle 68',5.0519000,-75.4891000,'PARADERO','2026-05-23 18:14:01.525479','2026-05-23 18:14:01.525479'),(11,'Villamaría',5.0460593,-75.5121660,'PARADERO','2026-05-31 23:02:07.658345','2026-05-31 23:02:07.658345');
/*!40000 ALTER TABLE `paradero` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `persona`
--

DROP TABLE IF EXISTS `persona`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `persona` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombres` varchar(120) NOT NULL,
  `apellidos` varchar(120) NOT NULL,
  `email` varchar(150) NOT NULL,
  `security_user_id` varchar(50) DEFAULT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_86ae2f9d6da4482363f832340b` (`email`),
  UNIQUE KEY `IDX_cfc6da8c352386f2e9ac87d88b` (`security_user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `persona`
--

LOCK TABLES `persona` WRITE;
/*!40000 ALTER TABLE `persona` DISABLE KEYS */;
INSERT INTO `persona` VALUES (1,'Ana Maria','Gomez Ruiz','ana.gomez@example.com',NULL,'3119998888','2026-04-30 19:26:45.099350','2026-04-30 19:30:59.000000'),(2,'Luis','Perez','luis.perez@example.com',NULL,NULL,'2026-04-30 19:27:24.459850','2026-04-30 19:27:24.459850'),(3,'Camilo','Angel','camilo.angel@test.com',NULL,'3001234567','2026-04-30 19:32:31.712676','2026-04-30 19:32:31.712676'),(11,'FotosCamilo','Sin Apellido','fotoscamilo3@gmail.com','69dcff1d806c6059f505ac13','3102290917','2026-05-18 13:56:22.966086','2026-05-18 13:56:22.966086'),(12,'Camilo','Angel','camilo.angel46131+1@ucaldas.edu.co','6a283c1b8e227d1ddf6601b1',NULL,'2026-06-09 11:16:48.047718','2026-06-09 11:16:48.047718');
/*!40000 ALTER TABLE `persona` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programacion`
--

DROP TABLE IF EXISTS `programacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `programacion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rutaId` int NOT NULL,
  `busId` int NOT NULL,
  `fecha` date NOT NULL,
  `recurrente` enum('UNICA','DIARIA','LUNES_A_VIERNES','FINES_DE_SEMANA') NOT NULL DEFAULT 'UNICA',
  `hora_salida` time NOT NULL,
  `tolerancia_minutos` int NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `conductorAsignadoId` int NOT NULL,
  `estado` varchar(30) NOT NULL DEFAULT 'PROGRAMADO',
  PRIMARY KEY (`id`),
  KEY `FK_6f757d5724fe0a8b55d98018b5b` (`rutaId`),
  KEY `FK_1ac4f03e1406663e62a634a4ce0` (`busId`),
  KEY `FK_f92fb1c3be9e469df091de0ff30` (`conductorAsignadoId`),
  CONSTRAINT `FK_1ac4f03e1406663e62a634a4ce0` FOREIGN KEY (`busId`) REFERENCES `bus` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_6f757d5724fe0a8b55d98018b5b` FOREIGN KEY (`rutaId`) REFERENCES `ruta` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_f92fb1c3be9e469df091de0ff30` FOREIGN KEY (`conductorAsignadoId`) REFERENCES `conductor` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programacion`
--

LOCK TABLES `programacion` WRITE;
/*!40000 ALTER TABLE `programacion` DISABLE KEYS */;
INSERT INTO `programacion` VALUES (2,3,1,'2026-06-02','UNICA','08:00:00',5,'2026-05-24 16:54:47.113431','2026-05-24 16:54:47.113431',1,'PROGRAMADO'),(4,8,3,'2026-06-02','UNICA','08:00:00',5,'2026-05-29 11:08:34.115652','2026-05-29 11:08:34.115652',2,'PROGRAMADO'),(5,11,1,'2026-06-01','UNICA','01:01:00',5,'2026-06-01 01:06:50.436625','2026-06-01 02:10:40.000000',2,'FINALIZADO'),(6,11,3,'2026-06-01','LUNES_A_VIERNES','20:00:00',5,'2026-06-01 01:35:10.095570','2026-06-01 01:35:10.095570',2,'PROGRAMADO'),(7,5,4,'2026-06-01','UNICA','20:00:00',5,'2026-06-01 01:45:47.055534','2026-06-01 01:45:47.055534',2,'PROGRAMADO'),(8,5,4,'2026-06-06','FINES_DE_SEMANA','22:00:00',5,'2026-06-06 21:48:32.144422','2026-06-06 22:11:39.000000',2,'FINALIZADO'),(9,5,5,'2026-06-08','UNICA','01:23:00',5,'2026-06-08 01:37:42.687001','2026-06-08 03:33:26.000000',2,'FINALIZADO'),(10,8,3,'2026-06-09','UNICA','08:00:00',5,'2026-06-08 02:16:18.255298','2026-06-08 02:16:18.255298',2,'PROGRAMADO'),(11,8,4,'2026-06-08','UNICA','02:00:00',5,'2026-06-08 02:47:17.196634','2026-06-08 04:04:15.000000',2,'FINALIZADO'),(12,11,4,'2026-06-08','UNICA','17:30:00',5,'2026-06-08 17:32:32.510887','2026-06-08 17:32:50.000000',2,'EN_CURSO'),(13,11,5,'2026-06-12','UNICA','20:00:00',5,'2026-06-12 19:51:09.134234','2026-06-12 19:51:20.000000',2,'EN_CURSO');
/*!40000 ALTER TABLE `programacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ruta`
--

DROP TABLE IF EXISTS `ruta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ruta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `tarifa` decimal(10,2) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_7f4af0cef9fb7c4203dee858ac` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ruta`
--

LOCK TABLES `ruta` WRITE;
/*!40000 ALTER TABLE `ruta` DISABLE KEYS */;
INSERT INTO `ruta` VALUES (1,'Ruta Norte','Ruta demo para pruebas',2500.00,'2026-04-29 23:09:56.033718','2026-04-29 23:09:56.033718'),(3,'Ruta Centro','Ruta principal por el centro',2500.50,'2026-04-30 12:05:00.040526','2026-04-30 12:05:00.040526'),(4,'Ruta Demo con 3 paraderos','Cumple HU-ENTR-2-009',2500.00,'2026-04-30 18:14:51.076433','2026-04-30 18:14:51.076433'),(5,'Ruta Transversal Manizales','Ruta principal desde Chipre hasta La Enea pasando por el Cable',2500.50,'2026-05-23 18:14:34.612717','2026-05-23 18:14:34.612717'),(8,'Ruta Manizales Colectiva','Cumple HU-ENTR-2-009 con paraderos nuevos de Manizales',2500.00,'2026-05-24 09:39:51.407108','2026-05-24 09:39:51.407108'),(10,'Test Verify',NULL,1000.00,'2026-05-31 22:08:51.117597','2026-05-31 22:08:51.117597'),(11,'Tarea 2009','Verificación tarea 2009',4500.00,'2026-05-31 22:33:14.269957','2026-05-31 22:33:14.269957');
/*!40000 ALTER TABLE `ruta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ruta_paradero`
--

DROP TABLE IF EXISTS `ruta_paradero`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ruta_paradero` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orden` int NOT NULL,
  `distancia_desde_anterior` decimal(10,2) DEFAULT NULL,
  `tiempo_estimado_desde_anterior` int DEFAULT NULL,
  `rutaId` int NOT NULL,
  `paraderoId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_ruta_paradero_ruta_paradero` (`rutaId`,`paraderoId`),
  UNIQUE KEY `UQ_ruta_paradero_ruta_orden` (`rutaId`,`orden`),
  KEY `FK_dbfcc37f869b92a6491ec02ba99` (`paraderoId`),
  CONSTRAINT `FK_ca55297a190c192b6d6f0dee88e` FOREIGN KEY (`rutaId`) REFERENCES `ruta` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_dbfcc37f869b92a6491ec02ba99` FOREIGN KEY (`paraderoId`) REFERENCES `paradero` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ruta_paradero`
--

LOCK TABLES `ruta_paradero` WRITE;
/*!40000 ALTER TABLE `ruta_paradero` DISABLE KEYS */;
INSERT INTO `ruta_paradero` VALUES (1,6,2.15,7,8,10),(2,3,10.80,15,1,3),(4,1,0.00,0,1,4),(5,1,0.00,0,4,1),(6,2,1.25,4,4,3),(7,3,0.80,3,4,4),(8,1,0.00,0,8,5),(9,2,1.25,4,8,6),(10,3,0.80,3,8,7),(11,4,1.50,5,8,8),(12,5,3.40,10,8,9),(14,1,NULL,NULL,10,1),(15,2,NULL,NULL,10,3),(16,3,NULL,NULL,10,4),(17,1,NULL,NULL,11,6),(18,2,200.00,5,11,5),(19,3,1200.00,20,11,8);
/*!40000 ALTER TABLE `ruta_paradero` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaccion_pago`
--

DROP TABLE IF EXISTS `transaccion_pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaccion_pago` (
  `id` int NOT NULL AUTO_INCREMENT,
  `referencia` varchar(60) NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `estado` enum('PENDIENTE','APROBADA','RECHAZADA') NOT NULL DEFAULT 'PENDIENTE',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `metodoPagoCiudadanoId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_cfa6a49be8c1103fc9e3f23698` (`referencia`),
  KEY `FK_8d9ce7670e1eba17d537064977d` (`metodoPagoCiudadanoId`),
  CONSTRAINT `FK_8d9ce7670e1eba17d537064977d` FOREIGN KEY (`metodoPagoCiudadanoId`) REFERENCES `metodo_pago_ciudadano` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaccion_pago`
--

LOCK TABLES `transaccion_pago` WRITE;
/*!40000 ALTER TABLE `transaccion_pago` DISABLE KEYS */;
INSERT INTO `transaccion_pago` VALUES (1,'REC-1780892279075-1',10000.00,'PENDIENTE','2026-06-07 23:17:59.085246','2026-06-07 23:17:59.085246',1),(2,'REC-1780892662146-1',10000.00,'PENDIENTE','2026-06-07 23:24:22.150378','2026-06-07 23:24:22.150378',1);
/*!40000 ALTER TABLE `transaccion_pago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `turno`
--

DROP TABLE IF EXISTS `turno`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `turno` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inicio` datetime NOT NULL,
  `fin` datetime DEFAULT NULL,
  `estado` enum('PROGRAMADO','EN_CURSO','FINALIZADO') NOT NULL DEFAULT 'PROGRAMADO',
  `observaciones` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `conductorId` int NOT NULL,
  `busId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_7c9e9687f8247eaa642fd394121` (`conductorId`),
  KEY `FK_6bd20f512dadade10ae6ba081a0` (`busId`),
  CONSTRAINT `FK_6bd20f512dadade10ae6ba081a0` FOREIGN KEY (`busId`) REFERENCES `bus` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_7c9e9687f8247eaa642fd394121` FOREIGN KEY (`conductorId`) REFERENCES `conductor` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `turno`
--

LOCK TABLES `turno` WRITE;
/*!40000 ALTER TABLE `turno` DISABLE KEYS */;
INSERT INTO `turno` VALUES (1,'2026-04-30 03:00:00','2026-05-02 11:31:21','FINALIZADO','Bus operativo','2026-05-02 11:28:20.155339','2026-05-02 11:31:20.000000',1,1),(2,'2026-04-30 03:00:00','2026-05-19 10:35:34','FINALIZADO','Turno de prueba','2026-05-19 10:33:19.117111','2026-05-19 10:35:33.000000',1,1),(3,'2026-06-02 06:00:00',NULL,'PROGRAMADO','Turno de prueba','2026-05-19 10:42:47.709643','2026-05-19 10:42:47.709643',1,1),(4,'2026-06-02 06:00:00',NULL,'PROGRAMADO','Turno de prueba','2026-05-24 17:37:32.722513','2026-05-24 17:37:32.722513',1,3),(5,'2026-06-02 06:00:00',NULL,'PROGRAMADO','Turno de prueba','2026-05-27 11:16:19.939316','2026-05-27 11:16:19.939316',1,3),(6,'2026-06-02 06:00:00',NULL,'PROGRAMADO','Turno de prueba','2026-05-29 10:55:13.844977','2026-05-29 10:55:13.844977',1,3),(7,'2026-06-02 06:00:00','2026-06-01 00:43:23','FINALIZADO','Turno de prueba','2026-05-29 11:07:05.051143','2026-06-01 00:43:23.000000',2,3),(8,'2026-06-01 01:01:00','2026-06-01 01:31:29','FINALIZADO',NULL,'2026-06-01 01:01:09.850984','2026-06-01 01:31:28.000000',2,1),(9,'2026-06-01 01:49:00','2026-06-01 01:50:14','FINALIZADO',NULL,'2026-06-01 01:49:04.756102','2026-06-01 01:50:13.000000',2,1),(10,'2026-06-01 01:01:00','2026-06-01 02:10:40','FINALIZADO',NULL,'2026-06-01 02:10:12.729196','2026-06-01 02:10:40.000000',2,1),(11,'2026-06-06 22:00:00','2026-06-06 22:06:52','FINALIZADO',NULL,'2026-06-06 22:04:35.903243','2026-06-06 22:06:51.000000',2,4),(12,'2026-06-06 22:11:01','2026-06-06 22:11:39','FINALIZADO',NULL,'2026-06-06 22:11:01.444418','2026-06-06 22:11:39.000000',2,4),(13,'2026-06-08 01:37:49','2026-06-08 01:38:42','FINALIZADO',NULL,'2026-06-08 01:37:48.552208','2026-06-08 01:38:42.000000',2,5),(14,'2026-06-08 02:23:55','2026-06-08 02:24:19','FINALIZADO',NULL,'2026-06-08 02:23:54.792020','2026-06-08 02:24:19.000000',2,5),(15,'2026-06-08 03:33:18','2026-06-08 03:33:27','FINALIZADO',NULL,'2026-06-08 03:33:18.130462','2026-06-08 03:33:26.000000',2,5),(16,'2026-06-08 04:01:39','2026-06-08 04:04:16','FINALIZADO',NULL,'2026-06-08 04:01:38.831303','2026-06-08 04:04:15.000000',2,4),(17,'2026-06-08 17:32:51','2026-06-12 19:45:00','FINALIZADO',NULL,'2026-06-08 17:32:49.127056','2026-06-12 19:44:59.000000',2,4),(18,'2026-06-12 19:51:20',NULL,'EN_CURSO',NULL,'2026-06-12 19:51:16.818356','2026-06-12 19:51:20.000000',2,5);
/*!40000 ALTER TABLE `turno` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-15 16:54:38
