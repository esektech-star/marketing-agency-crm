CREATE TABLE `appUsers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(100) NOT NULL,
	`passwordHash` text NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`email` varchar(320),
	`role` enum('مدير','موظف','مصمم','محرر') NOT NULL DEFAULT 'موظف',
	`preferredLanguage` enum('ar','he','en') NOT NULL DEFAULT 'ar',
	`status` enum('نشط','معطل') NOT NULL DEFAULT 'نشط',
	`lastLogin` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appUsers_id` PRIMARY KEY(`id`),
	CONSTRAINT `appUsers_username_unique` UNIQUE(`username`)
);
