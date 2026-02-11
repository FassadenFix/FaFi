ALTER TABLE `constructionSiteLogs` MODIFY COLUMN `logType` enum('arbeitsbeginn','fortschritt','pause','problem','material','arbeitsende','wetter','sicherheit','kundenkontakt','geraeteausfall','sonstiges') NOT NULL;--> statement-breakpoint
ALTER TABLE `constructionSiteLogs` ADD `workDayStarted` timestamp;--> statement-breakpoint
ALTER TABLE `constructionSiteLogs` ADD `workDayEnded` timestamp;--> statement-breakpoint
ALTER TABLE `constructionSiteLogs` ADD `plannedAreas` json;--> statement-breakpoint
ALTER TABLE `constructionSiteLogs` ADD `completedAreas` json;--> statement-breakpoint
ALTER TABLE `constructionSiteLogs` ADD `planningOnTrack` boolean;--> statement-breakpoint
ALTER TABLE `constructionSiteLogs` ADD `planningDeviation` text;--> statement-breakpoint
ALTER TABLE `constructionSiteLogs` ADD `urgency` enum('normal','hoch','kritisch') DEFAULT 'normal';--> statement-breakpoint
ALTER TABLE `constructionSiteLogs` ADD `weatherMorning` json;--> statement-breakpoint
ALTER TABLE `constructionSiteLogs` ADD `weatherNoon` json;--> statement-breakpoint
ALTER TABLE `constructionSiteLogs` ADD `weatherEvening` json;