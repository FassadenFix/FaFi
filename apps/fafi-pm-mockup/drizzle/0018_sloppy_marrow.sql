ALTER TABLE `constructionSites` ADD `siteStatus` enum('green','yellow','red') DEFAULT 'green';--> statement-breakpoint
ALTER TABLE `projects` ADD `phaseStatus` enum('green','yellow','red') DEFAULT 'green';--> statement-breakpoint
ALTER TABLE `tasks` ADD `responsibleParty` enum('auftraggeber','auftragnehmer') DEFAULT 'auftragnehmer';