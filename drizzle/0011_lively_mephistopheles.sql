CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` enum('create','update','delete','view','export','login','logout') NOT NULL,
	`entityType` varchar(100) NOT NULL,
	`entityId` int,
	`entityName` varchar(255),
	`changes` json,
	`ipAddress` varchar(45),
	`userAgent` text,
	`status` enum('success','failed') NOT NULL DEFAULT 'success',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
