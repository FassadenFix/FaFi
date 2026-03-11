ALTER TABLE `constructionSites` ADD `preDocumentationStatus` enum('pending','in_progress','completed') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `constructionSites` ADD `preDocumentationCompletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `constructionSites` ADD `postDocumentationStatus` enum('pending','in_progress','completed') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `constructionSites` ADD `postDocumentationCompletedAt` timestamp;