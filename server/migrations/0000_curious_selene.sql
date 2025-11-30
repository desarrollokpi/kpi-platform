CREATE TABLE `accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`subDomain` varchar(100) NOT NULL,
	`dataBase` varchar(100),
	`keyUser` varchar(64),
	`password` varchar(15),
	`logoAddress` varchar(150),
	`active` boolean NOT NULL DEFAULT true,
	`deletedAt` datetime,
	`createdAt` datetime NOT NULL DEFAULT now(),
	`updatedAt` datetime NOT NULL DEFAULT now(),
	CONSTRAINT `accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `accountsSubdomainUnique` UNIQUE(`subDomain`)
);
--> statement-breakpoint
CREATE TABLE `accountContract` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int NOT NULL,
	`nombre` varchar(100),
	`adress` varchar(100),
	`active` boolean NOT NULL DEFAULT true,
	`deletedAt` datetime,
	`createdAt` datetime NOT NULL DEFAULT now(),
	`updatedAt` datetime NOT NULL DEFAULT now(),
	CONSTRAINT `accountContract_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dashboards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`instanceId` int NOT NULL,
	`supersetDashboardId` int,
	`embeddedId` varchar(64),
	`name` varchar(100) NOT NULL,
	`reportId` int NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`deletedAt` datetime,
	`createdAt` datetime NOT NULL DEFAULT now(),
	`updatedAt` datetime NOT NULL DEFAULT now(),
	CONSTRAINT `dashboards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `usersDashboards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dashboardId` int NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`deletedAt` datetime,
	`createdAt` datetime NOT NULL DEFAULT now(),
	`updatedAt` datetime NOT NULL DEFAULT now(),
	CONSTRAINT `usersDashboards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int,
	`userName` varchar(64) NOT NULL,
	`name` varchar(150),
	`mail` varchar(100) NOT NULL,
	`password` varchar(64) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`deletedAt` datetime,
	`createdAt` datetime NOT NULL DEFAULT now(),
	`updatedAt` datetime NOT NULL DEFAULT now(),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_mail_unique` UNIQUE(`mail`),
	CONSTRAINT `usersUsernameUnique` UNIQUE(`userName`),
	CONSTRAINT `usersEmailUnique` UNIQUE(`mail`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(64) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`deletedAt` datetime,
	`createdAt` datetime NOT NULL DEFAULT now(),
	`updatedAt` datetime NOT NULL DEFAULT now(),
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `rolesNameUnique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `usersRoles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`roleId` int NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`deletedAt` datetime,
	`createdAt` datetime NOT NULL DEFAULT now(),
	`updatedAt` datetime NOT NULL DEFAULT now(),
	CONSTRAINT `usersRoles_id` PRIMARY KEY(`id`),
	CONSTRAINT `usersRolesUnique` UNIQUE(`userId`,`roleId`)
);
--> statement-breakpoint
CREATE TABLE `instances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`baseUrl` text NOT NULL,
	`apiUserName` varchar(255) NOT NULL,
	`apiPassword` text NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`deletedAt` datetime,
	`createdAt` datetime NOT NULL DEFAULT now(),
	`updatedAt` datetime NOT NULL DEFAULT now(),
	CONSTRAINT `instances_id` PRIMARY KEY(`id`),
	CONSTRAINT `instancesNameUnique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `accountsInstances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int NOT NULL,
	`instanceId` int NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`deletedAt` datetime,
	`createdAt` datetime NOT NULL DEFAULT now(),
	`updatedAt` datetime NOT NULL DEFAULT now(),
	CONSTRAINT `accountsInstances_id` PRIMARY KEY(`id`),
	CONSTRAINT `aiUnique` UNIQUE(`accountId`,`instanceId`)
);
--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`deletedAt` datetime,
	`createdAt` datetime NOT NULL DEFAULT now(),
	`updatedAt` datetime NOT NULL DEFAULT now(),
	CONSTRAINT `workspaces_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `accountsInstancesWorkspaces` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountInstanceId` int NOT NULL,
	`workspaceId` int NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`deletedAt` datetime,
	`createdAt` datetime NOT NULL DEFAULT now(),
	`updatedAt` datetime NOT NULL DEFAULT now(),
	CONSTRAINT `accountsInstancesWorkspaces_id` PRIMARY KEY(`id`),
	CONSTRAINT `aiwUnique` UNIQUE(`accountInstanceId`,`workspaceId`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`deletedAt` datetime,
	`createdAt` datetime NOT NULL DEFAULT now(),
	`updatedAt` datetime NOT NULL DEFAULT now(),
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `accountContract` ADD CONSTRAINT `accountContract_accountId_accounts_id_fk` FOREIGN KEY (`accountId`) REFERENCES `accounts`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dashboards` ADD CONSTRAINT `dashboards_reportId_reports_id_fk` FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `usersDashboards` ADD CONSTRAINT `usersDashboards_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `usersDashboards` ADD CONSTRAINT `usersDashboards_dashboardId_dashboards_id_fk` FOREIGN KEY (`dashboardId`) REFERENCES `dashboards`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_accountId_accounts_id_fk` FOREIGN KEY (`accountId`) REFERENCES `accounts`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `usersRoles` ADD CONSTRAINT `usersRoles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `usersRoles` ADD CONSTRAINT `usersRoles_roleId_roles_id_fk` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `accountsInstances` ADD CONSTRAINT `accountsInstances_accountId_accounts_id_fk` FOREIGN KEY (`accountId`) REFERENCES `accounts`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `accountsInstances` ADD CONSTRAINT `accountsInstances_instanceId_instances_id_fk` FOREIGN KEY (`instanceId`) REFERENCES `instances`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `accountsInstancesWorkspaces` ADD CONSTRAINT `aiwAiFK` FOREIGN KEY (`accountInstanceId`) REFERENCES `accountsInstances`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `accountsInstancesWorkspaces` ADD CONSTRAINT `aiwWsFK` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reports` ADD CONSTRAINT `reports_workspaceId_workspaces_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `dashboardsReportIdx` ON `dashboards` (`reportId`);--> statement-breakpoint
CREATE INDEX `dashboardsActiveIdx` ON `dashboards` (`active`);--> statement-breakpoint
CREATE INDEX `dashboardsInstanceIdx` ON `dashboards` (`instanceId`);--> statement-breakpoint
CREATE INDEX `udUserIdx` ON `usersDashboards` (`userId`);--> statement-breakpoint
CREATE INDEX `udDashboardIdx` ON `usersDashboards` (`dashboardId`);--> statement-breakpoint
CREATE INDEX `udActiveIdx` ON `usersDashboards` (`active`);--> statement-breakpoint
CREATE INDEX `udUserActiveIdx` ON `usersDashboards` (`userId`,`active`);--> statement-breakpoint
CREATE INDEX `usersAccountIdx` ON `users` (`accountId`);--> statement-breakpoint
CREATE INDEX `usersRolesUserIdx` ON `usersRoles` (`userId`);--> statement-breakpoint
CREATE INDEX `usersRolesRoleIdx` ON `usersRoles` (`roleId`);--> statement-breakpoint
CREATE INDEX `aiAccountIdx` ON `accountsInstances` (`accountId`);--> statement-breakpoint
CREATE INDEX `aiIntanceIdx` ON `accountsInstances` (`instanceId`);--> statement-breakpoint
CREATE INDEX `aiwAiIdx` ON `accountsInstancesWorkspaces` (`accountInstanceId`);--> statement-breakpoint
CREATE INDEX `aiwWorkspaceIdx` ON `accountsInstancesWorkspaces` (`workspaceId`);--> statement-breakpoint
CREATE INDEX `aiwActiveIdx` ON `accountsInstancesWorkspaces` (`active`);--> statement-breakpoint
CREATE INDEX `reportsWorkspaceIdx` ON `reports` (`workspaceId`);--> statement-breakpoint
CREATE INDEX `reportsActiveIdx` ON `reports` (`active`);