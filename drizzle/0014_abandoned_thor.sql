CREATE TABLE `sumitInvoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`invoiceId` varchar(255) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'SAR',
	`description` text,
	`status` enum('draft','sent','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
	`dueDate` timestamp,
	`paidDate` timestamp,
	`paymentMethod` varchar(50),
	`sumitReference` varchar(255),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sumitInvoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `sumitInvoices_invoiceId_unique` UNIQUE(`invoiceId`)
);
--> statement-breakpoint
CREATE TABLE `sumitSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`apiKey` varchar(500) NOT NULL,
	`apiSecret` varchar(500) NOT NULL,
	`businessId` varchar(255) NOT NULL,
	`isEnabled` boolean NOT NULL DEFAULT true,
	`autoCreateInvoice` boolean NOT NULL DEFAULT false,
	`autoSendInvoice` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sumitSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sumitSyncLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`syncType` enum('create','update','payment','cancel') NOT NULL,
	`status` enum('pending','success','failed') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`response` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sumitSyncLog_id` PRIMARY KEY(`id`)
);
