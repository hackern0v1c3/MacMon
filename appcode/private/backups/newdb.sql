-- MySQL dump 10.13  Distrib 5.7.24, for Linux (x86_64)
--
-- Host: localhost    Database: AssetTracking
-- ------------------------------------------------------
-- Server version	5.7.24-0ubuntu0.18.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `AssetTypes`
--

DROP TABLE IF EXISTS `AssetTypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `AssetTypes` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Assets`
--

DROP TABLE IF EXISTS `Assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Assets` (
  `MAC` varchar(50) NOT NULL,
  `Name` varchar(50) DEFAULT NULL,
  `Description` varchar(1000) DEFAULT NULL,
  `Vendor` varchar(1000) DEFAULT NULL,
  `IP` varchar(1000) DEFAULT NULL,
  `Nmap` varchar(1000) DEFAULT NULL,
  `Whitelisted` bit(1) NOT NULL DEFAULT b'0',
  `Guest` bit(1) NOT NULL DEFAULT b'0',
  `AssetType` int(11) NOT NULL DEFAULT '1',
  `LastUpdated` datetime DEFAULT CURRENT_TIMESTAMP,
  `FirstSeen` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MAC`),
  KEY `AssetType` (`AssetType`),
  CONSTRAINT `Assets_ibfk_1` FOREIGN KEY (`AssetType`) REFERENCES `AssetTypes` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `roleName` varchar(32) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roleName` (`roleName`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `unapprovedAssetsWithTypes`
--

DROP TABLE IF EXISTS `unapprovedAssetsWithTypes`;
/*!50001 DROP VIEW IF EXISTS `unapprovedAssetsWithTypes`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `unapprovedAssetsWithTypes` AS SELECT 
 1 AS `MAC`,
 1 AS `Name`,
 1 AS `Description`,
 1 AS `Vendor`,
 1 AS `IP`,
 1 AS `LastUpdated`,
 1 AS `Nmap`,
 1 AS `AssetType`,
 1 AS `AssetTypeName`,
 1 AS `FirstSeen`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userName` varchar(100) NOT NULL,
  `userPass` varchar(100) NOT NULL,
  `userRole` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userName` (`userName`),
  KEY `userRole` (`userRole`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`userRole`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `usersWithRoles`
--

DROP TABLE IF EXISTS `usersWithRoles`;
/*!50001 DROP VIEW IF EXISTS `usersWithRoles`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `usersWithRoles` AS SELECT 
 1 AS `id`,
 1 AS `userName`,
 1 AS `userPass`,
 1 AS `userRole`,
 1 AS `roleName`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `whitelistedAssetsWithTypes`
--

DROP TABLE IF EXISTS `whitelistedAssetsWithTypes`;
/*!50001 DROP VIEW IF EXISTS `whitelistedAssetsWithTypes`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `whitelistedAssetsWithTypes` AS SELECT 
 1 AS `MAC`,
 1 AS `Name`,
 1 AS `Description`,
 1 AS `Vendor`,
 1 AS `IP`,
 1 AS `LastUpdated`,
 1 AS `Nmap`,
 1 AS `AssetType`,
 1 AS `AssetTypeName`,
 1 AS `FirstSeen`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `whitelistedGuestAssetsWithTypes`
--

DROP TABLE IF EXISTS `whitelistedGuestAssetsWithTypes`;
/*!50001 DROP VIEW IF EXISTS `whitelistedGuestAssetsWithTypes`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `whitelistedGuestAssetsWithTypes` AS SELECT 
 1 AS `MAC`,
 1 AS `Name`,
 1 AS `Description`,
 1 AS `Vendor`,
 1 AS `IP`,
 1 AS `LastUpdated`,
 1 AS `Nmap`,
 1 AS `AssetType`,
 1 AS `AssetTypeName`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `unapprovedAssetsWithTypes`
--

/*!50001 DROP VIEW IF EXISTS `unapprovedAssetsWithTypes`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `unapprovedAssetsWithTypes` AS select `Assets`.`MAC` AS `MAC`,`Assets`.`Name` AS `Name`,`Assets`.`Description` AS `Description`,`Assets`.`Vendor` AS `Vendor`,`Assets`.`IP` AS `IP`,`Assets`.`LastUpdated` AS `LastUpdated`,`Assets`.`Nmap` AS `Nmap`,`Assets`.`AssetType` AS `AssetType`,`Assets`.`FirstSeen` AS `FirstSeen`,`AssetTypes`.`Name` AS `AssetTypeName` from (`Assets` join `AssetTypes` on((`Assets`.`AssetType` = `AssetTypes`.`ID`))) where (not(`Assets`.`Whitelisted`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `usersWithRoles`
--

/*!50001 DROP VIEW IF EXISTS `usersWithRoles`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `usersWithRoles` AS select `users`.`id` AS `id`,`users`.`userName` AS `userName`,`users`.`userPass` AS `userPass`,`users`.`userRole` AS `userRole`,`roles`.`roleName` AS `roleName` from (`users` join `roles` on((`users`.`userRole` = `roles`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `whitelistedAssetsWithTypes`
--

/*!50001 DROP VIEW IF EXISTS `whitelistedAssetsWithTypes`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `whitelistedAssetsWithTypes` AS select `Assets`.`MAC` AS `MAC`,`Assets`.`Name` AS `Name`,`Assets`.`Description` AS `Description`,`Assets`.`Vendor` AS `Vendor`,`Assets`.`IP` AS `IP`,`Assets`.`LastUpdated` AS `LastUpdated`,`Assets`.`Nmap` AS `Nmap`,`Assets`.`AssetType` AS `AssetType`,`Assets`.`FirstSeen` AS `FirstSeen`,`AssetTypes`.`Name` AS `AssetTypeName` from (`Assets` join `AssetTypes` on((`Assets`.`AssetType` = `AssetTypes`.`ID`))) where (`Assets`.`Whitelisted` and (not(`Assets`.`Guest`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `whitelistedGuestAssetsWithTypes`
--

/*!50001 DROP VIEW IF EXISTS `whitelistedGuestAssetsWithTypes`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `whitelistedGuestAssetsWithTypes` AS select `Assets`.`MAC` AS `MAC`,`Assets`.`Name` AS `Name`,`Assets`.`Description` AS `Description`,`Assets`.`Vendor` AS `Vendor`,`Assets`.`IP` AS `IP`,`Assets`.`LastUpdated` AS `LastUpdated`,`Assets`.`Nmap` AS `Nmap`,`Assets`.`AssetType` AS `AssetType`,`AssetTypes`.`Name` AS `AssetTypeName` from (`Assets` join `AssetTypes` on((`Assets`.`AssetType` = `AssetTypes`.`ID`))) where (`Assets`.`Whitelisted` and `Assets`.`Guest`) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-12-04 11:30:24