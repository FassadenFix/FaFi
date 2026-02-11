CREATE TABLE `followUpReminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`offerId` int NOT NULL,
	`projectId` int,
	`dueAt` timestamp NOT NULL,
	`status` enum('pending','completed','dismissed','overdue') NOT NULL DEFAULT 'pending',
	`reminderType` enum('auto_7d','auto_14d','auto_30d','custom') NOT NULL DEFAULT 'auto_7d',
	`notes` text,
	`completedAt` timestamp,
	`completedById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `followUpReminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `offers` ADD `followUpDueAt` timestamp;--> statement-breakpoint
ALTER TABLE `offers` ADD `followUpCount` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `followUpReminders` ADD CONSTRAINT `followUpReminders_offerId_offers_id_fk` FOREIGN KEY (`offerId`) REFERENCES `offers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `followUpReminders` ADD CONSTRAINT `followUpReminders_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `followUpReminders` ADD CONSTRAINT `followUpReminders_completedById_users_id_fk` FOREIGN KEY (`completedById`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;