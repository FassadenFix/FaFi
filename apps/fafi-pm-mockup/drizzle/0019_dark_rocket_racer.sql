CREATE TABLE `portalFeedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`projectId` int NOT NULL,
	`contactId` int,
	`overallRating` int NOT NULL,
	`qualityRating` int,
	`communicationRating` int,
	`timelinessRating` int,
	`positiveComment` text,
	`improvementComment` text,
	`wouldRecommend` boolean,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `portalFeedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portalMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`projectId` int,
	`senderType` enum('customer','fassadenfix') NOT NULL,
	`senderName` varchar(255) NOT NULL,
	`senderContactId` int,
	`senderUserId` int,
	`subject` varchar(500),
	`message` text NOT NULL,
	`attachmentUrls` json,
	`isRead` boolean NOT NULL DEFAULT false,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `portalMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portalUploads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`projectId` int,
	`contactId` int,
	`fileName` varchar(500) NOT NULL,
	`fileUrl` varchar(2000) NOT NULL,
	`fileSize` int,
	`mimeType` varchar(100),
	`category` enum('vollmacht','genehmigung','vertrag','sonstiges') NOT NULL DEFAULT 'sonstiges',
	`description` text,
	`status` enum('eingegangen','geprueft','abgelehnt') NOT NULL DEFAULT 'eingegangen',
	`reviewedBy` int,
	`reviewNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `portalUploads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `portalFeedback` ADD CONSTRAINT `portalFeedback_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `portalFeedback` ADD CONSTRAINT `portalFeedback_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `portalFeedback` ADD CONSTRAINT `portalFeedback_contactId_contacts_id_fk` FOREIGN KEY (`contactId`) REFERENCES `contacts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `portalMessages` ADD CONSTRAINT `portalMessages_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `portalMessages` ADD CONSTRAINT `portalMessages_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `portalMessages` ADD CONSTRAINT `portalMessages_senderContactId_contacts_id_fk` FOREIGN KEY (`senderContactId`) REFERENCES `contacts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `portalMessages` ADD CONSTRAINT `portalMessages_senderUserId_users_id_fk` FOREIGN KEY (`senderUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `portalUploads` ADD CONSTRAINT `portalUploads_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `portalUploads` ADD CONSTRAINT `portalUploads_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `portalUploads` ADD CONSTRAINT `portalUploads_contactId_contacts_id_fk` FOREIGN KEY (`contactId`) REFERENCES `contacts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `portalUploads` ADD CONSTRAINT `portalUploads_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;