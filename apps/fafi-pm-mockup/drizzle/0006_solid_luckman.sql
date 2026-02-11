CREATE TABLE `syncStatus` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` enum('contact','company','deal','project','property') NOT NULL,
	`localId` int NOT NULL,
	`hubspotId` varchar(64),
	`syncDirection` enum('import','export','bidirectional') DEFAULT 'import',
	`lastSyncAt` timestamp,
	`lastLocalUpdate` timestamp,
	`lastHubspotUpdate` timestamp,
	`syncStatus` enum('synced','pending','conflict','error') DEFAULT 'pending',
	`conflictData` json,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `syncStatus_id` PRIMARY KEY(`id`)
);
