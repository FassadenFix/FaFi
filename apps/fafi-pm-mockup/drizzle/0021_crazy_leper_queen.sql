ALTER TABLE `constructionSites` ADD `orderId` int;--> statement-breakpoint
ALTER TABLE `constructionSites` ADD `offerId` int;--> statement-breakpoint
ALTER TABLE `orders` ADD `positions` json;--> statement-breakpoint
ALTER TABLE `orders` ADD `specialConditions` json;--> statement-breakpoint
ALTER TABLE `orders` ADD `discount` decimal(5,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `orders` ADD `discountReason` varchar(255);--> statement-breakpoint
ALTER TABLE `orders` ADD `scaffoldingDays` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `orders` ADD `overnightStays` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `orders` ADD `distanceKm` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `constructionSites` ADD CONSTRAINT `constructionSites_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `constructionSites` ADD CONSTRAINT `constructionSites_offerId_offers_id_fk` FOREIGN KEY (`offerId`) REFERENCES `offers`(`id`) ON DELETE no action ON UPDATE no action;