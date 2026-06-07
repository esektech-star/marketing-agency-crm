CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fileName` varchar(500) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`fileUrl` varchar(500) NOT NULL,
	`mimeType` varchar(255),
	`fileSize` int,
	`category` varchar(255),
	`relatedClient` int,
	`relatedCampaign` int,
	`uploadedBy` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
