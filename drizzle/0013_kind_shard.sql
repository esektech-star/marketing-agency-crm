CREATE TABLE `whatsappMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`phoneNumber` varchar(20) NOT NULL,
	`messageType` enum('lead','task','performance','custom') NOT NULL,
	`templateName` varchar(255),
	`content` text NOT NULL,
	`status` enum('pending','sent','delivered','read','failed') NOT NULL DEFAULT 'pending',
	`sentAt` timestamp,
	`deliveredAt` timestamp,
	`readAt` timestamp,
	`errorMessage` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `whatsappMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whatsappSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessPhoneNumberId` varchar(255) NOT NULL,
	`accessToken` varchar(500) NOT NULL,
	`businessAccountId` varchar(255) NOT NULL,
	`isEnabled` boolean NOT NULL DEFAULT true,
	`autoSendOnNewLead` boolean NOT NULL DEFAULT false,
	`autoSendOnNewTask` boolean NOT NULL DEFAULT false,
	`autoSendPerformanceAlerts` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `whatsappSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whatsappTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` enum('lead','task','performance','custom') NOT NULL,
	`content` text NOT NULL,
	`variables` json,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `whatsappTemplates_id` PRIMARY KEY(`id`),
	CONSTRAINT `whatsappTemplates_name_unique` UNIQUE(`name`)
);
