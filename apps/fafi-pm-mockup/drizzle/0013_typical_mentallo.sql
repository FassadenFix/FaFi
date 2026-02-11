ALTER TABLE `notifications` MODIFY COLUMN `type` enum('task_assigned','task_due','project_status','offer_status','system','reminder','dunning','follow_up','hubspot_sync','workflow') NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` ADD `priority` enum('normal','high','critical') DEFAULT 'normal' NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` ADD `link` varchar(500);