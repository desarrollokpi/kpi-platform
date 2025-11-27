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
	`idAccounts` int NOT NULL,
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
	`supersetId` int NOT NULL,
	`embeddedId` varchar(64),
	`name` varchar(100) NOT NULL,
	`reportsId` int NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`deletedAt` datetime,
	`createdAt` datetime NOT NULL DEFAULT now(),
	`updatedAt` datetime NOT NULL DEFAULT now(),
	CONSTRAINT `dashboards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `usersDashboards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`idUsers` int NOT NULL,
	`dashboardsId` int NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`deletedAt` datetime,
	`createdAt` datetime NOT NULL DEFAULT now(),
	`updatedAt` datetime NOT NULL DEFAULT now(),
	CONSTRAINT `usersDashboards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountsId` int,
	`userName` varchar(64) NOT NULL,
	`name` varchar(150),
	`mail` varchar(100) NOT NULL,
	`password` varchar(64) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`deletedAt` datetime,
	`createdAt` datetime NOT NULL DEFAULT now(),
	`updatedAt` datetime NOT NULL DEFAULT now(),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
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
	`usersId` int NOT NULL,
	`rolesId` int NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`deletedAt` datetime,
	`createdAt` datetime NOT NULL DEFAULT now(),
	`updatedAt` datetime NOT NULL DEFAULT now(),
	CONSTRAINT `usersRoles_id` PRIMARY KEY(`id`),
	CONSTRAINT `usersRolesUnique` UNIQUE(`usersId`,`rolesId`)
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
	`accountsId` int NOT NULL,
	`instancesId` int NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`deletedAt` datetime,
	`createdAt` datetime NOT NULL DEFAULT now(),
	`updatedAt` datetime NOT NULL DEFAULT now(),
	CONSTRAINT `accountsInstances_id` PRIMARY KEY(`id`),
	CONSTRAINT `aiUnique` UNIQUE(`accountsId`,`instancesId`)
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
	`idAccountsInstances` int NOT NULL,
	`idWorkspaces` int NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`deletedAt` datetime,
	`createdAt` datetime NOT NULL DEFAULT now(),
	`updatedAt` datetime NOT NULL DEFAULT now(),
	CONSTRAINT `accountsInstancesWorkspaces_id` PRIMARY KEY(`id`),
	CONSTRAINT `aiwUnique` UNIQUE(`idAccountsInstances`,`idWorkspaces`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspacesId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`deletedAt` datetime,
	`createdAt` datetime NOT NULL DEFAULT now(),
	`updatedAt` datetime NOT NULL DEFAULT now(),
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `accountContract` ADD CONSTRAINT `accountContract_idAccounts_accounts_id_fk` FOREIGN KEY (`idAccounts`) REFERENCES `accounts`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dashboards` ADD CONSTRAINT `dashboards_reportsId_reports_id_fk` FOREIGN KEY (`reportsId`) REFERENCES `reports`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `usersDashboards` ADD CONSTRAINT `usersDashboards_idUsers_users_id_fk` FOREIGN KEY (`idUsers`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `usersDashboards` ADD CONSTRAINT `usersDashboards_dashboardsId_dashboards_id_fk` FOREIGN KEY (`dashboardsId`) REFERENCES `dashboards`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_accountsId_accounts_id_fk` FOREIGN KEY (`accountsId`) REFERENCES `accounts`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `usersRoles` ADD CONSTRAINT `usersRoles_usersId_users_id_fk` FOREIGN KEY (`usersId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `usersRoles` ADD CONSTRAINT `usersRoles_rolesId_roles_id_fk` FOREIGN KEY (`rolesId`) REFERENCES `roles`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `accountsInstances` ADD CONSTRAINT `accountsInstances_accountsId_accounts_id_fk` FOREIGN KEY (`accountsId`) REFERENCES `accounts`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `accountsInstances` ADD CONSTRAINT `accountsInstances_instancesId_instances_id_fk` FOREIGN KEY (`instancesId`) REFERENCES `instances`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `accountsInstancesWorkspaces` ADD CONSTRAINT `aiwAiFK` FOREIGN KEY (`idAccountsInstances`) REFERENCES `accountsInstances`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `accountsInstancesWorkspaces` ADD CONSTRAINT `aiwWsFK` FOREIGN KEY (`idWorkspaces`) REFERENCES `workspaces`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reports` ADD CONSTRAINT `reports_workspacesId_workspaces_id_fk` FOREIGN KEY (`workspacesId`) REFERENCES `workspaces`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `dashboardsReportIdx` ON `dashboards` (`reportsId`);--> statement-breakpoint
CREATE INDEX `dashboardsActiveIdx` ON `dashboards` (`active`);--> statement-breakpoint
CREATE INDEX `dashboardsSupersetIdx` ON `dashboards` (`supersetId`);--> statement-breakpoint
CREATE INDEX `udUserIdx` ON `usersDashboards` (`idUsers`);--> statement-breakpoint
CREATE INDEX `udDashboardIdx` ON `usersDashboards` (`dashboardsId`);--> statement-breakpoint
CREATE INDEX `udActiveIdx` ON `usersDashboards` (`active`);--> statement-breakpoint
CREATE INDEX `udUserActiveIdx` ON `usersDashboards` (`idUsers`,`active`);--> statement-breakpoint
CREATE INDEX `usersAccountIdx` ON `users` (`accountsId`);--> statement-breakpoint
CREATE INDEX `usersRolesUserIdx` ON `usersRoles` (`usersId`);--> statement-breakpoint
CREATE INDEX `usersRolesRoleIdx` ON `usersRoles` (`rolesId`);--> statement-breakpoint
CREATE INDEX `aiAccountIdx` ON `accountsInstances` (`accountsId`);--> statement-breakpoint
CREATE INDEX `aiIntanceIdx` ON `accountsInstances` (`instancesId`);--> statement-breakpoint
CREATE INDEX `aiwAiIdx` ON `accountsInstancesWorkspaces` (`idAccountsInstances`);--> statement-breakpoint
CREATE INDEX `aiwWorkspaceIdx` ON `accountsInstancesWorkspaces` (`idWorkspaces`);--> statement-breakpoint
CREATE INDEX `aiwActiveIdx` ON `accountsInstancesWorkspaces` (`active`);--> statement-breakpoint
CREATE INDEX `reportsWorkspaceIdx` ON `reports` (`workspacesId`);--> statement-breakpoint
CREATE INDEX `reportsActiveIdx` ON `reports` (`active`);