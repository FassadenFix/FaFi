CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`originalName` varchar(255) NOT NULL,
	`fileType` enum('dokument','bild','video','sonstiges') DEFAULT 'dokument',
	`mimeType` varchar(100),
	`fileSize` int,
	`s3Key` varchar(500) NOT NULL,
	`s3Url` text NOT NULL,
	`projectId` int,
	`propertyId` int,
	`constructionSiteId` int,
	`offerId` int,
	`category` varchar(100),
	`description` text,
	`uploadedById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` enum('angebot','nachfassen','auftrag','rechnung','sonstiges') NOT NULL,
	`subject` varchar(500) NOT NULL,
	`body` text NOT NULL,
	`placeholders` json,
	`isActive` boolean DEFAULT true,
	`usageCount` int DEFAULT 0,
	`createdById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `offer_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`introductionBlockId` int,
	`conclusionBlockId` int,
	`conditionBlockIds` json,
	`defaultPaymentDays` int DEFAULT 7,
	`defaultValidityDays` int DEFAULT 28,
	`isActive` boolean DEFAULT true,
	`usageCount` int DEFAULT 0,
	`createdById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `offer_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `text_blocks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` enum('einleitung','abschluss','rabatt','konditionen','versprechen','sonstiges') NOT NULL,
	`content` text NOT NULL,
	`placeholders` json,
	`isActive` boolean DEFAULT true,
	`usageCount` int DEFAULT 0,
	`createdById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `text_blocks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_propertyId_properties_id_fk` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_constructionSiteId_constructionSites_id_fk` FOREIGN KEY (`constructionSiteId`) REFERENCES `constructionSites`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_offerId_offers_id_fk` FOREIGN KEY (`offerId`) REFERENCES `offers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_uploadedById_users_id_fk` FOREIGN KEY (`uploadedById`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_templates` ADD CONSTRAINT `email_templates_createdById_users_id_fk` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `offer_templates` ADD CONSTRAINT `offer_templates_introductionBlockId_text_blocks_id_fk` FOREIGN KEY (`introductionBlockId`) REFERENCES `text_blocks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `offer_templates` ADD CONSTRAINT `offer_templates_conclusionBlockId_text_blocks_id_fk` FOREIGN KEY (`conclusionBlockId`) REFERENCES `text_blocks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `offer_templates` ADD CONSTRAINT `offer_templates_createdById_users_id_fk` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `text_blocks` ADD CONSTRAINT `text_blocks_createdById_users_id_fk` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;