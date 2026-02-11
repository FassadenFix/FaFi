ALTER TABLE `documents` ADD `companyId` int;--> statement-breakpoint
ALTER TABLE `documents` ADD `contactId` int;--> statement-breakpoint
ALTER TABLE `offers` ADD `hubspotDealId` varchar(64);--> statement-breakpoint
ALTER TABLE `projects` ADD `hubspotDealId` varchar(64);--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_contactId_contacts_id_fk` FOREIGN KEY (`contactId`) REFERENCES `contacts`(`id`) ON DELETE no action ON UPDATE no action;