ALTER TABLE `properties` ADD `isDraft` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `properties` ADD `wizardStep` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `properties` ADD `wizardData` json;