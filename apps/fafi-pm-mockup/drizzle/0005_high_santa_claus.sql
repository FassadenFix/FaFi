CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`appointmentType` enum('objektaufnahme','kundentermin','baustellenbesichtigung','abnahme','nachbesserung','intern') NOT NULL DEFAULT 'kundentermin',
	`status` enum('vorgeschlagen','bestaetigt','abgesagt','verschoben','durchgefuehrt') NOT NULL DEFAULT 'vorgeschlagen',
	`projectId` int,
	`companyId` int,
	`contactId` int,
	`propertyId` int,
	`proposedDates` json,
	`confirmedDate` timestamp,
	`confirmedStartTime` varchar(10),
	`confirmedEndTime` varchar(10),
	`location` varchar(500),
	`isOnsite` boolean DEFAULT true,
	`assignedToId` int,
	`participants` json,
	`reminderSent` boolean DEFAULT false,
	`reminderSentAt` timestamp,
	`notes` text,
	`createdById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `budgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`budgetType` enum('projekt','abteilung','marketing','personal','material','sonstiges') NOT NULL DEFAULT 'projekt',
	`projectId` int,
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`plannedAmount` decimal(12,2) DEFAULT '0',
	`actualAmount` decimal(12,2) DEFAULT '0',
	`remainingAmount` decimal(12,2) DEFAULT '0',
	`categories` json,
	`status` enum('aktiv','ueberschritten','abgeschlossen') NOT NULL DEFAULT 'aktiv',
	`warningThreshold` int DEFAULT 80,
	`alertSent` boolean DEFAULT false,
	`notes` text,
	`responsibleId` int,
	`createdById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budgets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customerReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportNumber` varchar(50) NOT NULL,
	`companyId` int,
	`contactId` int,
	`projectId` int,
	`propertyId` int,
	`orderId` int,
	`warrantyId` int,
	`reportType` enum('reklamation','anfrage','lob','beschwerde','garantiefall','sonstiges') NOT NULL DEFAULT 'anfrage',
	`priority` enum('niedrig','normal','hoch','dringend') NOT NULL DEFAULT 'normal',
	`status` enum('neu','in_bearbeitung','warten_auf_kunde','geloest','abgeschlossen') NOT NULL DEFAULT 'neu',
	`subject` varchar(500) NOT NULL,
	`description` text NOT NULL,
	`resolution` text,
	`resolvedAt` timestamp,
	`resolvedById` int,
	`attachments` json,
	`internalNotes` text,
	`customerNotified` boolean DEFAULT false,
	`lastCustomerContact` timestamp,
	`assignedToId` int,
	`createdById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customerReports_id` PRIMARY KEY(`id`),
	CONSTRAINT `customerReports_reportNumber_unique` UNIQUE(`reportNumber`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceNumber` varchar(50) NOT NULL,
	`orderId` int,
	`projectId` int,
	`companyId` int,
	`contactId` int,
	`invoiceType` enum('abschlagsrechnung','schlussrechnung','teilrechnung','gutschrift') NOT NULL DEFAULT 'schlussrechnung',
	`status` enum('entwurf','erstellt','versendet','bezahlt','teilbezahlt','ueberfaellig','storniert','gemahnt') NOT NULL DEFAULT 'entwurf',
	`netTotal` decimal(12,2) DEFAULT '0',
	`vatRate` decimal(5,2) DEFAULT '19.00',
	`vatAmount` decimal(12,2) DEFAULT '0',
	`grossTotal` decimal(12,2) DEFAULT '0',
	`paidAmount` decimal(12,2) DEFAULT '0',
	`openAmount` decimal(12,2) DEFAULT '0',
	`positions` json,
	`invoiceDate` timestamp NOT NULL DEFAULT (now()),
	`dueDate` timestamp,
	`sentAt` timestamp,
	`paidAt` timestamp,
	`dunningLevel` int DEFAULT 0,
	`lastDunningDate` timestamp,
	`pdfUrl` text,
	`notes` text,
	`createdById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(50) NOT NULL,
	`projectId` int,
	`offerId` int,
	`companyId` int,
	`contactId` int,
	`status` enum('bestaetigt','in_vorbereitung','in_durchfuehrung','abgeschlossen','storniert') NOT NULL DEFAULT 'bestaetigt',
	`netTotal` decimal(12,2) DEFAULT '0',
	`vatAmount` decimal(12,2) DEFAULT '0',
	`grossTotal` decimal(12,2) DEFAULT '0',
	`orderDate` timestamp NOT NULL DEFAULT (now()),
	`plannedStartDate` timestamp,
	`plannedEndDate` timestamp,
	`actualStartDate` timestamp,
	`actualEndDate` timestamp,
	`kundenberaterId` int,
	`projektleiterId` int,
	`hubspotDealId` varchar(64),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`paymentNumber` varchar(50) NOT NULL,
	`invoiceId` int,
	`companyId` int,
	`paymentType` enum('ueberweisung','lastschrift','bar','scheck','kreditkarte','paypal') NOT NULL DEFAULT 'ueberweisung',
	`status` enum('ausstehend','eingegangen','zugeordnet','rueckbuchung') NOT NULL DEFAULT 'ausstehend',
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(3) DEFAULT 'EUR',
	`bankReference` varchar(255),
	`bankAccountIban` varchar(34),
	`paymentDate` timestamp NOT NULL,
	`valueDate` timestamp,
	`matchedAt` timestamp,
	`matchedById` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_paymentNumber_unique` UNIQUE(`paymentNumber`)
);
--> statement-breakpoint
CREATE TABLE `teamMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`employeeNumber` varchar(50),
	`department` enum('geschaeftsfuehrung','vertrieb','projektleitung','ausfuehrung','buero','buchhaltung') DEFAULT 'ausfuehrung',
	`position` varchar(100),
	`employmentType` enum('vollzeit','teilzeit','minijob','praktikum','freelancer') DEFAULT 'vollzeit',
	`hireDate` timestamp,
	`exitDate` timestamp,
	`workPhone` varchar(50),
	`workMobile` varchar(50),
	`emergencyContact` varchar(255),
	`emergencyPhone` varchar(50),
	`skills` json,
	`certifications` json,
	`workingHours` json,
	`vacationDaysTotal` int DEFAULT 30,
	`vacationDaysUsed` int DEFAULT 0,
	`status` enum('aktiv','urlaub','krank','inaktiv') DEFAULT 'aktiv',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teamMembers_id` PRIMARY KEY(`id`),
	CONSTRAINT `teamMembers_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `warranties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`warrantyNumber` varchar(50) NOT NULL,
	`orderId` int,
	`projectId` int,
	`companyId` int,
	`propertyId` int,
	`warrantyType` enum('algenfrei_garantie','ergebnisgarantie','materialgarantie') NOT NULL DEFAULT 'algenfrei_garantie',
	`status` enum('aktiv','abgelaufen','beansprucht','erfuellt') NOT NULL DEFAULT 'aktiv',
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`durationYears` int DEFAULT 5,
	`claimDate` timestamp,
	`claimDescription` text,
	`claimResolution` text,
	`claimResolvedAt` timestamp,
	`certificateUrl` text,
	`notes` text,
	`createdById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `warranties_id` PRIMARY KEY(`id`),
	CONSTRAINT `warranties_warrantyNumber_unique` UNIQUE(`warrantyNumber`)
);
--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_contactId_contacts_id_fk` FOREIGN KEY (`contactId`) REFERENCES `contacts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_propertyId_properties_id_fk` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_assignedToId_users_id_fk` FOREIGN KEY (`assignedToId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_createdById_users_id_fk` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `budgets` ADD CONSTRAINT `budgets_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `budgets` ADD CONSTRAINT `budgets_responsibleId_users_id_fk` FOREIGN KEY (`responsibleId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `budgets` ADD CONSTRAINT `budgets_createdById_users_id_fk` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customerReports` ADD CONSTRAINT `customerReports_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customerReports` ADD CONSTRAINT `customerReports_contactId_contacts_id_fk` FOREIGN KEY (`contactId`) REFERENCES `contacts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customerReports` ADD CONSTRAINT `customerReports_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customerReports` ADD CONSTRAINT `customerReports_propertyId_properties_id_fk` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customerReports` ADD CONSTRAINT `customerReports_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customerReports` ADD CONSTRAINT `customerReports_warrantyId_warranties_id_fk` FOREIGN KEY (`warrantyId`) REFERENCES `warranties`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customerReports` ADD CONSTRAINT `customerReports_resolvedById_users_id_fk` FOREIGN KEY (`resolvedById`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customerReports` ADD CONSTRAINT `customerReports_assignedToId_users_id_fk` FOREIGN KEY (`assignedToId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customerReports` ADD CONSTRAINT `customerReports_createdById_users_id_fk` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_contactId_contacts_id_fk` FOREIGN KEY (`contactId`) REFERENCES `contacts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_createdById_users_id_fk` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_offerId_offers_id_fk` FOREIGN KEY (`offerId`) REFERENCES `offers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_contactId_contacts_id_fk` FOREIGN KEY (`contactId`) REFERENCES `contacts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_kundenberaterId_users_id_fk` FOREIGN KEY (`kundenberaterId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_projektleiterId_users_id_fk` FOREIGN KEY (`projektleiterId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_invoiceId_invoices_id_fk` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_matchedById_users_id_fk` FOREIGN KEY (`matchedById`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teamMembers` ADD CONSTRAINT `teamMembers_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `warranties` ADD CONSTRAINT `warranties_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `warranties` ADD CONSTRAINT `warranties_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `warranties` ADD CONSTRAINT `warranties_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `warranties` ADD CONSTRAINT `warranties_propertyId_properties_id_fk` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `warranties` ADD CONSTRAINT `warranties_createdById_users_id_fk` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;