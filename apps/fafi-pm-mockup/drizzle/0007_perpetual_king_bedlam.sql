ALTER TABLE `documents` ADD `orderId` int;--> statement-breakpoint
ALTER TABLE `documents` ADD `invoiceId` int;--> statement-breakpoint
ALTER TABLE `documents` ADD `warrantyId` int;--> statement-breakpoint
ALTER TABLE `documents` ADD `appointmentId` int;--> statement-breakpoint
ALTER TABLE `documents` ADD `taskId` int;--> statement-breakpoint
ALTER TABLE `documents` ADD `hubspotNoteId` varchar(64);--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_invoiceId_invoices_id_fk` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_warrantyId_warranties_id_fk` FOREIGN KEY (`warrantyId`) REFERENCES `warranties`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_appointmentId_appointments_id_fk` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_taskId_tasks_id_fk` FOREIGN KEY (`taskId`) REFERENCES `tasks`(`id`) ON DELETE no action ON UPDATE no action;