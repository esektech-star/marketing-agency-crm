CREATE TABLE `accessDetails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` varchar(255) NOT NULL,
	`username` varchar(255) NOT NULL,
	`password` text NOT NULL,
	`email` varchar(320),
	`url` varchar(500),
	`relatedClient` int,
	`notes` text,
	`isEncrypted` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accessDetails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`platform` varchar(255) NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`budget` decimal(12,2),
	`status` enum('مخطط','نشط','معلق','منتهي') NOT NULL DEFAULT 'مخطط',
	`relatedClient` int,
	`description` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`serviceType` varchar(255) NOT NULL,
	`status` enum('نشط','معلق','منتهي') NOT NULL DEFAULT 'نشط',
	`startDate` timestamp NOT NULL,
	`phone` varchar(20),
	`email` varchar(320),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(20),
	`company` varchar(255),
	`source` varchar(255) NOT NULL,
	`stage` enum('جديد','متابعة','اهتمام','عرض','تفاوض','مغلق') NOT NULL DEFAULT 'جديد',
	`status` enum('نشط','معطل','مفقود') NOT NULL DEFAULT 'نشط',
	`value` decimal(10,2),
	`notes` text,
	`assignedTo` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`assignedTo` int,
	`dueDate` timestamp NOT NULL,
	`priority` enum('منخفضة','متوسطة','عالية','حرجة') NOT NULL DEFAULT 'متوسطة',
	`status` enum('معلقة','قيد التنفيذ','مكتملة','ملغاة') NOT NULL DEFAULT 'معلقة',
	`relatedClient` int,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teamMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`role` varchar(255) NOT NULL,
	`position` varchar(255),
	`phone` varchar(20),
	`email` varchar(320),
	`department` varchar(255),
	`joinDate` timestamp NOT NULL,
	`status` enum('نشط','معطل','منتهي') NOT NULL DEFAULT 'نشط',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teamMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('إيراد','مصروف') NOT NULL,
	`category` varchar(255) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`description` text,
	`date` timestamp NOT NULL,
	`relatedClient` int,
	`relatedVendor` int,
	`month` varchar(10) NOT NULL,
	`year` int NOT NULL,
	`notes` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`serviceType` varchar(255) NOT NULL,
	`phone` varchar(20),
	`email` varchar(320),
	`website` varchar(255),
	`status` enum('نشط','معلق','غير نشط') NOT NULL DEFAULT 'نشط',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vendors_id` PRIMARY KEY(`id`)
);
