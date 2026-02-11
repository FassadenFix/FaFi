CREATE TABLE `tooltipFeedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`helpTextKey` varchar(100) NOT NULL,
	`userId` int NOT NULL,
	`rating` enum('helpful','not_helpful') NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tooltipFeedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `tooltipFeedback` ADD CONSTRAINT `tooltipFeedback_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;