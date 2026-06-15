ALTER TABLE `clients` DROP INDEX `clients_clientCode_unique`;--> statement-breakpoint
ALTER TABLE `clients` MODIFY COLUMN `clientCode` varchar(50);--> statement-breakpoint
ALTER TABLE `documents` MODIFY COLUMN `fileName` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `documents` MODIFY COLUMN `mimeType` varchar(100);--> statement-breakpoint
ALTER TABLE `documents` MODIFY COLUMN `category` varchar(100);--> statement-breakpoint
ALTER TABLE `campaigns` ADD `postLink` text;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `mediaUrl` text;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `mediaKey` varchar(512);--> statement-breakpoint
ALTER TABLE `campaigns` ADD `mediaType` varchar(50);--> statement-breakpoint
ALTER TABLE `clients` ADD `source` varchar(255);--> statement-breakpoint
ALTER TABLE `clients` ADD `paymentReminderTaskUid` varchar(65);--> statement-breakpoint
ALTER TABLE `documents` ADD `isInternal` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `teamMembers` ADD `salary` decimal(12,2);--> statement-breakpoint
ALTER TABLE `documents` DROP COLUMN `relatedTask`;