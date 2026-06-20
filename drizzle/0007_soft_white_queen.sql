CREATE TABLE `kpis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`year` int NOT NULL,
	`month` int NOT NULL,
	`monthlyRevenue` decimal(12,2) NOT NULL DEFAULT '0',
	`quarterlyRevenue` decimal(12,2) NOT NULL DEFAULT '0',
	`yearlyRevenue` decimal(12,2) NOT NULL DEFAULT '0',
	`monthlyChangePercent` decimal(8,4) NOT NULL DEFAULT '0',
	`yearOverYearChangePercent` decimal(8,4) NOT NULL DEFAULT '0',
	`quarterlyChangePercent` decimal(8,4) NOT NULL DEFAULT '0',
	`activeClientsCount` int NOT NULL DEFAULT 0,
	`totalExpenses` decimal(12,2) NOT NULL DEFAULT '0',
	`netProfit` decimal(12,2) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kpis_id` PRIMARY KEY(`id`)
);
