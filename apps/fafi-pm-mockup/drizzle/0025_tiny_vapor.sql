CREATE TABLE `gatePhotos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`constructionSiteId` int NOT NULL,
	`gateType` enum('vorher','nachher') NOT NULL,
	`photoUrl` text NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`caption` text,
	`uploadedById` int NOT NULL,
	`uploadedByName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gatePhotos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `teamleiterChecks` MODIFY COLUMN `checkType` enum('projektbesprechung','freitag_check','arbeitsbeginn_check') NOT NULL;--> statement-breakpoint
ALTER TABLE `constructionSites` ADD `teamleiterCheckStatus` enum('pending','completed') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `constructionSites` ADD `teamleiterCheckCompletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `constructionSites` ADD `teamleiterCheckUserId` int;--> statement-breakpoint
ALTER TABLE `gatePhotos` ADD CONSTRAINT `gatePhotos_constructionSiteId_constructionSites_id_fk` FOREIGN KEY (`constructionSiteId`) REFERENCES `constructionSites`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gatePhotos` ADD CONSTRAINT `gatePhotos_uploadedById_users_id_fk` FOREIGN KEY (`uploadedById`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `constructionSites` ADD CONSTRAINT `constructionSites_teamleiterCheckUserId_users_id_fk` FOREIGN KEY (`teamleiterCheckUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;