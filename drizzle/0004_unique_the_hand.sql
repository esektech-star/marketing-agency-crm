CREATE TABLE `clientPortalAccess` (
	`id` int AUTO_INCREMENT NOT NULL,
	`relatedClient` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`accessToken` varchar(500) NOT NULL,
	`expiresAt` timestamp,
	`canViewCampaigns` boolean NOT NULL DEFAULT true,
	`canViewInvoices` boolean NOT NULL DEFAULT true,
	`canDownloadFiles` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientPortalAccess_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceNumber` varchar(50) NOT NULL,
	`relatedClient` int NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`dueDate` timestamp NOT NULL,
	`status` enum('pending','paid','overdue') NOT NULL DEFAULT 'pending',
	`fileKey` varchar(500),
	`fileUrl` varchar(500),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('task_due','payment_reminder','task_assigned','campaign_update') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`relatedTaskId` int,
	`relatedClientId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `appUsers` MODIFY COLUMN `role` enum('manager','employee','designer','editor') NOT NULL DEFAULT 'employee';--> statement-breakpoint
ALTER TABLE `appUsers` MODIFY COLUMN `status` enum('active','disabled') NOT NULL DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `campaigns` MODIFY COLUMN `status` enum('planned','active','paused','completed') NOT NULL DEFAULT 'planned';--> statement-breakpoint
ALTER TABLE `clients` MODIFY COLUMN `status` enum('active','pending','completed') NOT NULL DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `leads` MODIFY COLUMN `stage` enum('new','follow_up','interest','proposal','negotiation','closed') NOT NULL DEFAULT 'new';--> statement-breakpoint
ALTER TABLE `leads` MODIFY COLUMN `status` enum('active','disabled','lost') NOT NULL DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `tasks` MODIFY COLUMN `assignedTo` json;--> statement-breakpoint
ALTER TABLE `tasks` MODIFY COLUMN `priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE `tasks` MODIFY COLUMN `status` enum('pending','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `teamMembers` MODIFY COLUMN `status` enum('active','disabled','completed') NOT NULL DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `transactions` MODIFY COLUMN `type` enum('revenue','expense') NOT NULL;--> statement-breakpoint
ALTER TABLE `vendors` MODIFY COLUMN `status` enum('active','pending','inactive') NOT NULL DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `appUsers` ADD `permissions` json;--> statement-breakpoint
ALTER TABLE `clients` ADD `clientCode` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `clients` ADD `monthlyAmount` decimal(12,2);--> statement-breakpoint
ALTER TABLE `clients` ADD `paymentDate` int;--> statement-breakpoint
ALTER TABLE `documents` ADD `relatedTask` int;--> statement-breakpoint
ALTER TABLE `tasks` ADD `attachments` json;--> statement-breakpoint
ALTER TABLE `clients` ADD CONSTRAINT `clients_clientCode_unique` UNIQUE(`clientCode`);