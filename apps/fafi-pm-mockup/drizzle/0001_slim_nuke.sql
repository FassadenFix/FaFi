CREATE TABLE `activityLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`userName` varchar(255),
	`action` enum('created','updated','deleted','sent','synced','status_changed','assigned','completed','uploaded','downloaded','login','logout') NOT NULL,
	`entityType` enum('project','property','construction_site','offer','company','contact','task','user','hubspot','system') NOT NULL,
	`entityId` int,
	`entityName` varchar(255),
	`details` text,
	`metadata` json,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activityLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `calendarEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`eventType` enum('baustelle','besprechung','termin','urlaub','krank','sonstiges') NOT NULL DEFAULT 'termin',
	`projectId` int,
	`constructionSiteId` int,
	`assignedToId` int,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`allDay` boolean DEFAULT false,
	`color` varchar(20),
	`createdById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `calendarEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hubspotId` varchar(64),
	`name` varchar(255) NOT NULL,
	`category` enum('wohnungsgesellschaft','hausverwaltung','privatperson','gewerbe','oeffentlich') DEFAULT 'hausverwaltung',
	`street` varchar(255),
	`postalCode` varchar(10),
	`city` varchar(100),
	`country` varchar(100) DEFAULT 'Deutschland',
	`phone` varchar(50),
	`email` varchar(320),
	`website` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `constructionSiteLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`constructionSiteId` int NOT NULL,
	`userId` int,
	`userName` varchar(255),
	`logType` enum('arbeitsbeginn','fortschritt','pause','problem','material','arbeitsende','wetter','sicherheit') NOT NULL,
	`entry` text NOT NULL,
	`photos` json,
	`metadata` json,
	`loggedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `constructionSiteLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `constructionSites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`siteNumber` varchar(50) NOT NULL,
	`projectId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` varchar(500),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`status` enum('geplant','aktiv','pausiert','abgeschlossen') NOT NULL DEFAULT 'geplant',
	`startDate` timestamp,
	`endDate` timestamp,
	`progress` int DEFAULT 0,
	`totalArea` decimal(12,2) DEFAULT '0',
	`projektleiterId` int,
	`teamMembers` json,
	`equipment` json,
	`weatherData` json,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `constructionSites_id` PRIMARY KEY(`id`),
	CONSTRAINT `constructionSites_siteNumber_unique` UNIQUE(`siteNumber`)
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hubspotId` varchar(64),
	`companyId` int,
	`salutation` enum('herr','frau','divers'),
	`firstName` varchar(100),
	`lastName` varchar(100) NOT NULL,
	`position` varchar(100),
	`phone` varchar(50),
	`mobile` varchar(50),
	`email` varchar(320),
	`isPrimary` boolean DEFAULT false,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customerPortalTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`contactId` int,
	`token` varchar(255) NOT NULL,
	`projectIds` json,
	`permissions` json,
	`expiresAt` timestamp,
	`lastAccessedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customerPortalTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `customerPortalTokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `dashboardWidgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`widgetType` varchar(50) NOT NULL,
	`title` varchar(255),
	`position` int DEFAULT 0,
	`width` enum('small','medium','large','full') DEFAULT 'medium',
	`config` json,
	`isVisible` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dashboardWidgets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('task_assigned','task_due','project_status','offer_status','system','reminder') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`entityType` varchar(50),
	`entityId` int,
	`isRead` boolean DEFAULT false,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `offers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`offerNumber` varchar(50) NOT NULL,
	`version` int NOT NULL DEFAULT 1,
	`projectId` int,
	`companyId` int,
	`contactId` int,
	`status` enum('entwurf','erstellt','versendet','angenommen','abgelehnt','abgelaufen') NOT NULL DEFAULT 'entwurf',
	`totalArea` decimal(12,2) DEFAULT '0',
	`pricePerSqm` decimal(8,2) DEFAULT '0',
	`basePrice` decimal(12,2) DEFAULT '0',
	`discount` decimal(5,2) DEFAULT '0',
	`discountReason` varchar(255),
	`travelCosts` decimal(10,2) DEFAULT '0',
	`netTotal` decimal(12,2) DEFAULT '0',
	`vatRate` decimal(5,2) DEFAULT '19.00',
	`vatAmount` decimal(12,2) DEFAULT '0',
	`grossTotal` decimal(12,2) DEFAULT '0',
	`scaffoldingDays` int DEFAULT 0,
	`overnightStays` int DEFAULT 0,
	`distanceKm` int DEFAULT 0,
	`positions` json,
	`textBlocks` json,
	`customText` text,
	`validUntil` timestamp,
	`sentAt` timestamp,
	`acceptedAt` timestamp,
	`pdfUrl` text,
	`createdById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `offers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectNumber` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`companyId` int,
	`contactId` int,
	`phase` enum('objektaufnahme','angebot_erstellt','angebot_versendet','nachfassen','auftrag_gewonnen','planung','vorbereitung','durchfuehrung','abnahme','abgeschlossen','verloren') NOT NULL DEFAULT 'objektaufnahme',
	`totalArea` decimal(12,2) DEFAULT '0',
	`propertyCount` int DEFAULT 0,
	`startDate` timestamp,
	`endDate` timestamp,
	`progress` int DEFAULT 0,
	`kundenberaterId` int,
	`projektleiterId` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`),
	CONSTRAINT `projects_projectNumber_unique` UNIQUE(`projectNumber`)
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int,
	`constructionSiteId` int,
	`name` varchar(255) NOT NULL,
	`street` varchar(255),
	`postalCode` varchar(10),
	`city` varchar(100),
	`frontSide` json,
	`backSide` json,
	`leftGable` json,
	`rightGable` json,
	`totalCleanableArea` decimal(12,2) DEFAULT '0',
	`specialFeatures` json,
	`accessNotes` text,
	`photos` json,
	`satelliteImageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `properties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int,
	`constructionSiteId` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('offen','in_bearbeitung','erledigt','abgebrochen') NOT NULL DEFAULT 'offen',
	`priority` enum('niedrig','normal','hoch','dringend') NOT NULL DEFAULT 'normal',
	`dueDate` timestamp,
	`assignedToId` int,
	`assignedRole` varchar(50),
	`completedAt` timestamp,
	`createdById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teamleiterChecks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`constructionSiteId` int,
	`checkType` enum('projektbesprechung','freitag_check') NOT NULL,
	`userId` int,
	`checkItems` json,
	`completedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teamleiterChecks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `fafiRole` enum('gf','kundenberater','at_leiter','projektleiter','buero') DEFAULT 'buero';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(50);--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;--> statement-breakpoint
ALTER TABLE `activityLogs` ADD CONSTRAINT `activityLogs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `calendarEvents` ADD CONSTRAINT `calendarEvents_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `calendarEvents` ADD CONSTRAINT `calendarEvents_constructionSiteId_constructionSites_id_fk` FOREIGN KEY (`constructionSiteId`) REFERENCES `constructionSites`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `calendarEvents` ADD CONSTRAINT `calendarEvents_assignedToId_users_id_fk` FOREIGN KEY (`assignedToId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `calendarEvents` ADD CONSTRAINT `calendarEvents_createdById_users_id_fk` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `constructionSiteLogs` ADD CONSTRAINT `constructionSiteLogs_constructionSiteId_constructionSites_id_fk` FOREIGN KEY (`constructionSiteId`) REFERENCES `constructionSites`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `constructionSiteLogs` ADD CONSTRAINT `constructionSiteLogs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `constructionSites` ADD CONSTRAINT `constructionSites_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `constructionSites` ADD CONSTRAINT `constructionSites_projektleiterId_users_id_fk` FOREIGN KEY (`projektleiterId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contacts` ADD CONSTRAINT `contacts_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customerPortalTokens` ADD CONSTRAINT `customerPortalTokens_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customerPortalTokens` ADD CONSTRAINT `customerPortalTokens_contactId_contacts_id_fk` FOREIGN KEY (`contactId`) REFERENCES `contacts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dashboardWidgets` ADD CONSTRAINT `dashboardWidgets_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `offers` ADD CONSTRAINT `offers_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `offers` ADD CONSTRAINT `offers_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `offers` ADD CONSTRAINT `offers_contactId_contacts_id_fk` FOREIGN KEY (`contactId`) REFERENCES `contacts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `offers` ADD CONSTRAINT `offers_createdById_users_id_fk` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_contactId_contacts_id_fk` FOREIGN KEY (`contactId`) REFERENCES `contacts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_kundenberaterId_users_id_fk` FOREIGN KEY (`kundenberaterId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_projektleiterId_users_id_fk` FOREIGN KEY (`projektleiterId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `properties` ADD CONSTRAINT `properties_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_constructionSiteId_constructionSites_id_fk` FOREIGN KEY (`constructionSiteId`) REFERENCES `constructionSites`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_assignedToId_users_id_fk` FOREIGN KEY (`assignedToId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_createdById_users_id_fk` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teamleiterChecks` ADD CONSTRAINT `teamleiterChecks_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teamleiterChecks` ADD CONSTRAINT `teamleiterChecks_constructionSiteId_constructionSites_id_fk` FOREIGN KEY (`constructionSiteId`) REFERENCES `constructionSites`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teamleiterChecks` ADD CONSTRAINT `teamleiterChecks_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;