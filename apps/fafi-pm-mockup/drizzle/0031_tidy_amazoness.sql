CREATE TABLE `employee_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`filename` varchar(500) NOT NULL,
	`category` varchar(100) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileKey` varchar(500),
	`mimeType` varchar(100),
	`sizeBytes` int,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `employee_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`personioId` int,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320),
	`gender` varchar(20),
	`status` enum('active','inactive','onboarding','leave') NOT NULL DEFAULT 'active',
	`position` varchar(200),
	`department` varchar(100),
	`office` varchar(100),
	`supervisor` varchar(200),
	`employmentType` varchar(50),
	`weeklyWorkingHours` varchar(10),
	`hireDate` varchar(20),
	`contractEndDate` varchar(20),
	`terminationDate` varchar(20),
	`terminationType` varchar(50),
	`probationPeriodEnd` varchar(20),
	`lastWorkingDay` varchar(20),
	`subcompany` varchar(200),
	`fixSalary` varchar(20),
	`fixSalaryInterval` varchar(20),
	`hourlySalary` varchar(20),
	`workSchedule` varchar(200),
	`profilePicture` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employees_id` PRIMARY KEY(`id`),
	CONSTRAINT `employees_personioId_unique` UNIQUE(`personioId`)
);
--> statement-breakpoint
ALTER TABLE `employee_documents` ADD CONSTRAINT `employee_documents_employeeId_employees_id_fk` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE no action ON UPDATE no action;