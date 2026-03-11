ALTER TABLE `users` ADD `microsoftId` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `microsoftAccessToken` text;--> statement-breakpoint
ALTER TABLE `users` ADD `microsoftRefreshToken` text;--> statement-breakpoint
ALTER TABLE `users` ADD `microsoftTokenExpiry` timestamp;