CREATE TABLE `scheduledTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` varchar(50) NOT NULL,
	`entityType` varchar(50),
	`entityId` int,
	`dueAt` timestamp NOT NULL,
	`status` enum('pending','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`attempts` int DEFAULT 0,
	`maxAttempts` int DEFAULT 3,
	`lastAttemptAt` timestamp,
	`completedAt` timestamp,
	`errorMessage` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduledTasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflowHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`fromPhase` varchar(50) NOT NULL,
	`toPhase` varchar(50) NOT NULL,
	`triggeredBy` varchar(20) NOT NULL,
	`userId` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workflowHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `workflowHistory` ADD CONSTRAINT `workflowHistory_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workflowHistory` ADD CONSTRAINT `workflowHistory_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;