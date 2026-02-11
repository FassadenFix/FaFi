CREATE TABLE `textbausteine` (
	`id` int AUTO_INCREMENT NOT NULL,
	`kategorie` enum('anschreiben','bedingungen','fussnoten','leistungsbeschreibung','sonstiges') NOT NULL,
	`titel` varchar(255) NOT NULL,
	`inhalt` text NOT NULL,
	`sortierung` int NOT NULL DEFAULT 0,
	`aktiv` boolean NOT NULL DEFAULT true,
	`tags` json,
	`createdBy` int,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `textbausteine_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `textbausteine` ADD CONSTRAINT `textbausteine_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `textbausteine` ADD CONSTRAINT `textbausteine_updatedBy_users_id_fk` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;