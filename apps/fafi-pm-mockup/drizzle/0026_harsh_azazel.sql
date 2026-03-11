CREATE TABLE `libraryAssets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`assetType` enum('laptop','smartphone','tablet','schluessel','tankkarte','kreditkarte','werkzeug','sonstiges') NOT NULL,
	`serialNumber` varchar(100),
	`inventoryNumber` varchar(50),
	`manufacturer` varchar(100),
	`model` varchar(100),
	`purchaseDate` timestamp,
	`purchasePrice` decimal(10,2),
	`warrantyUntil` timestamp,
	`assignedToMemberId` int,
	`assignedToName` varchar(255),
	`assignedAt` timestamp,
	`cardNumber` varchar(50),
	`pin` varchar(10),
	`description` text,
	`notes` text,
	`documents` json,
	`metadata` json,
	`status` enum('aktiv','inaktiv','verloren','defekt','zurueckgegeben') NOT NULL DEFAULT 'aktiv',
	`createdBy` int,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `libraryAssets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `libraryCleaningAgents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`articleNumber` varchar(50),
	`applicationArea` text,
	`containerSize` varchar(50),
	`purchasePrice` decimal(10,2),
	`sellingPrice` decimal(10,2),
	`coveragePerLiter` varchar(100),
	`safetyDataSheetUrl` text,
	`supplier` varchar(255),
	`minStock` int,
	`currentStock` int,
	`description` text,
	`notes` text,
	`documents` json,
	`metadata` json,
	`status` enum('aktiv','inaktiv','auslaufend') NOT NULL DEFAULT 'aktiv',
	`createdBy` int,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `libraryCleaningAgents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `libraryDiscounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`discountType` enum('preisstaffel','fruehbucher','mengenrabatt','treuerabatt','kennenlern','aktion','sonstiges') NOT NULL,
	`percentage` decimal(5,2),
	`absoluteAmount` decimal(10,2),
	`conditions` text,
	`validFrom` timestamp,
	`validUntil` timestamp,
	`stoererText` text,
	`stoererSubtext` text,
	`minFlaeche` int,
	`maxFlaeche` int,
	`pricePerSqm` decimal(10,2),
	`combinable` boolean DEFAULT true,
	`code` varchar(50),
	`description` text,
	`notes` text,
	`metadata` json,
	`status` enum('aktiv','inaktiv','abgelaufen') NOT NULL DEFAULT 'aktiv',
	`createdBy` int,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `libraryDiscounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `libraryEquipment` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`equipmentType` enum('gelenkteleskop','teleskop','scherenlift','anhaengerlift','hochdruckreiniger','sprühgeraet','sonstiges') NOT NULL,
	`manufacturer` varchar(100),
	`model` varchar(100),
	`maxHeight` decimal(5,1),
	`maxReach` decimal(5,1),
	`weight` decimal(8,0),
	`ownership` enum('eigen','miete','dauermiete','leasing') DEFAULT 'eigen',
	`dailyRate` decimal(10,2),
	`purchasePrice` decimal(10,2),
	`inspectionDate` timestamp,
	`serialNumber` varchar(100),
	`description` text,
	`notes` text,
	`documents` json,
	`metadata` json,
	`status` enum('aktiv','inaktiv','wartung','defekt') NOT NULL DEFAULT 'aktiv',
	`createdBy` int,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `libraryEquipment_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `libraryServices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`serviceType` enum('hauptleistung','zusatzleistung','garantie','wartung','inspektion') NOT NULL,
	`description` text,
	`scope` text,
	`duration` varchar(100),
	`basePrice` decimal(10,2),
	`pricingUnit` varchar(50),
	`includedInOffer` boolean DEFAULT true,
	`notes` text,
	`documents` json,
	`metadata` json,
	`status` enum('aktiv','inaktiv') NOT NULL DEFAULT 'aktiv',
	`createdBy` int,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `libraryServices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `libraryVehicles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`vehicleType` enum('waschbus','dienstwagen','poolfahrzeug','anhaenger','transporter') NOT NULL,
	`licensePlate` varchar(20),
	`manufacturer` varchar(100),
	`model` varchar(100),
	`year` int,
	`capacity` varchar(100),
	`tuevDate` timestamp,
	`insuranceExpiry` timestamp,
	`mileage` int,
	`fuelType` enum('diesel','benzin','elektro','hybrid'),
	`dailyCost` decimal(10,2),
	`assignedTo` varchar(255),
	`notes` text,
	`documents` json,
	`metadata` json,
	`status` enum('aktiv','inaktiv','werkstatt','verkauft') NOT NULL DEFAULT 'aktiv',
	`createdBy` int,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `libraryVehicles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `libraryWorkClothing` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`clothingType` enum('oberteil','hose','schuhe','handschuhe','helm','brille','gehoerschutz','weste','regenkleidung','sonstiges') NOT NULL,
	`size` varchar(20),
	`supplier` varchar(255),
	`articleNumber` varchar(50),
	`purchasePrice` decimal(10,2),
	`minStock` int,
	`currentStock` int,
	`isPSA` boolean DEFAULT false,
	`certificationRequired` boolean DEFAULT false,
	`description` text,
	`notes` text,
	`documents` json,
	`metadata` json,
	`status` enum('aktiv','inaktiv','bestellt') NOT NULL DEFAULT 'aktiv',
	`createdBy` int,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `libraryWorkClothing_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `teamMembers` ADD `canViewLibrary` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `teamMembers` ADD `canEditLibrary` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `libraryAssets` ADD CONSTRAINT `libraryAssets_assignedToMemberId_teamMembers_id_fk` FOREIGN KEY (`assignedToMemberId`) REFERENCES `teamMembers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `libraryAssets` ADD CONSTRAINT `libraryAssets_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `libraryAssets` ADD CONSTRAINT `libraryAssets_updatedBy_users_id_fk` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `libraryCleaningAgents` ADD CONSTRAINT `libraryCleaningAgents_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `libraryCleaningAgents` ADD CONSTRAINT `libraryCleaningAgents_updatedBy_users_id_fk` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `libraryDiscounts` ADD CONSTRAINT `libraryDiscounts_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `libraryDiscounts` ADD CONSTRAINT `libraryDiscounts_updatedBy_users_id_fk` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `libraryEquipment` ADD CONSTRAINT `libraryEquipment_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `libraryEquipment` ADD CONSTRAINT `libraryEquipment_updatedBy_users_id_fk` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `libraryServices` ADD CONSTRAINT `libraryServices_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `libraryServices` ADD CONSTRAINT `libraryServices_updatedBy_users_id_fk` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `libraryVehicles` ADD CONSTRAINT `libraryVehicles_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `libraryVehicles` ADD CONSTRAINT `libraryVehicles_updatedBy_users_id_fk` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `libraryWorkClothing` ADD CONSTRAINT `libraryWorkClothing_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `libraryWorkClothing` ADD CONSTRAINT `libraryWorkClothing_updatedBy_users_id_fk` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;