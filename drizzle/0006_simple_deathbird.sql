CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`softwareName` varchar(255) NOT NULL,
	`monthlyAmount` decimal(12,2) NOT NULL,
	`purpose` text,
	`website` varchar(255),
	`username` varchar(255),
	`password` text,
	`isEncrypted` boolean DEFAULT false,
	`renewalDate` int,
	`status` enum('active','inactive','expired') NOT NULL DEFAULT 'active',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
