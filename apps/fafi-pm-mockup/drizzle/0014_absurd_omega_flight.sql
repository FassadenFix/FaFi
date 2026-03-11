CREATE TABLE `photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int,
	`constructionSiteId` int,
	`logEntryId` int,
	`projectId` int,
	`uploadedById` int,
	`url` text NOT NULL,
	`thumbnailUrl` text,
	`filename` varchar(500) NOT NULL,
	`originalFilename` varchar(500),
	`mimeType` varchar(100) DEFAULT 'image/jpeg',
	`fileSize` int,
	`context` enum('objektaufnahme','vorher_dokumentation','nachher_dokumentation','baustelle_fortschritt','ereignis','abnahme','schaden','allgemein') NOT NULL DEFAULT 'allgemein',
	`category` varchar(100),
	`side` enum('front','back','left_gable','right_gable','roof','other'),
	`description` text,
	`companyName` varchar(255),
	`address` varchar(500),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`sortOrder` int DEFAULT 0,
	`takenAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `photos` ADD CONSTRAINT `photos_propertyId_properties_id_fk` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `photos` ADD CONSTRAINT `photos_constructionSiteId_constructionSites_id_fk` FOREIGN KEY (`constructionSiteId`) REFERENCES `constructionSites`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `photos` ADD CONSTRAINT `photos_logEntryId_constructionSiteLogs_id_fk` FOREIGN KEY (`logEntryId`) REFERENCES `constructionSiteLogs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `photos` ADD CONSTRAINT `photos_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `photos` ADD CONSTRAINT `photos_uploadedById_users_id_fk` FOREIGN KEY (`uploadedById`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;