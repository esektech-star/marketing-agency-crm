CREATE TABLE `alertHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertId` int NOT NULL,
	`action` enum('created','acknowledged','resolved','escalated') NOT NULL,
	`performedBy` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alertHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `alertRules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`ruleType` enum('roi_drop','conversion_drop','cpc_increase','impressions_low','custom') NOT NULL,
	`metric` varchar(100) NOT NULL,
	`operator` enum('less_than','greater_than','equals','not_equals') NOT NULL,
	`threshold` decimal(10,2) NOT NULL,
	`duration` int,
	`isEnabled` boolean NOT NULL DEFAULT true,
	`notifyAdminOnly` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alertRules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ruleId` int NOT NULL,
	`campaignId` int,
	`clientId` int,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`currentValue` decimal(10,2),
	`threshold` decimal(10,2),
	`status` enum('active','acknowledged','resolved') NOT NULL DEFAULT 'active',
	`acknowledgedBy` int,
	`acknowledgedAt` timestamp,
	`resolvedAt` timestamp,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
