CREATE TABLE `projectProperties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`propertyId` int NOT NULL,
	`role` varchar(50) DEFAULT 'primary',
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `projectProperties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `properties` ADD `companyId` int;--> statement-breakpoint
ALTER TABLE `projectProperties` ADD CONSTRAINT `projectProperties_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projectProperties` ADD CONSTRAINT `projectProperties_propertyId_properties_id_fk` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `properties` ADD CONSTRAINT `properties_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;