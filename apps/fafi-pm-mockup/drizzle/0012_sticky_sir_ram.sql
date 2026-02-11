CREATE TABLE `dunningEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`projectId` int,
	`companyId` int,
	`level` int NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`dunningFee` decimal(8,2) DEFAULT '0',
	`sentVia` enum('email','post','manual') NOT NULL DEFAULT 'email',
	`sentAt` timestamp,
	`status` enum('draft','sent','paid','escalated','cancelled') NOT NULL DEFAULT 'draft',
	`subject` varchar(500),
	`body` text,
	`pdfUrl` text,
	`notes` text,
	`createdById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dunningEntries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `dunningEntries` ADD CONSTRAINT `dunningEntries_invoiceId_invoices_id_fk` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dunningEntries` ADD CONSTRAINT `dunningEntries_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dunningEntries` ADD CONSTRAINT `dunningEntries_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dunningEntries` ADD CONSTRAINT `dunningEntries_createdById_users_id_fk` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;