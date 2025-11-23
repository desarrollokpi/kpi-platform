-- Antes que nada, ya se había agregado la tabla
-- adm_account_workspaces, en una relación 1:N

-- Primero se droppean las tablas que no se van a usar
drop table adm_accounts_reports;
drop table adm_users_reports_groups;
drop table pbi_workspaces_reports;
drop table pbi_workspaces;
drop table int_industries;
drop table pbi_workspaces_reports_sections;
drop table pbi_reports_groups_headers;
drop table pbi_reports_groups_body;
drop table adm_users_reports_groups;

-- Ahora se debe manejar los grupos de reporte
-- Consultar grupos de reportes, sin reportes asociados
CREATE TABLE IF NOT EXISTS `reporteria-test`.`adm_report_groups`
(
    `id_adm_report_groups` INT         NOT NULL AUTO_INCREMENT,
    `code`                 VARCHAR(45) NOT NULL,
    `name`                 VARCHAR(45) NOT NULL,
    `active`               TINYINT(1)  NOT NULL DEFAULT 1,
    `id_adm_account`       INT         NOT NULL,
    PRIMARY KEY (`id_adm_report_groups`),
    INDEX `fk_adm_report_groups_adm_accounts1_idx` (`id_adm_account` ASC) VISIBLE,
    UNIQUE INDEX `code_UNIQUE` (`code` ASC) VISIBLE,
    UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE,
    CONSTRAINT `fk_adm_report_groups_adm_accounts1`
        FOREIGN KEY (`id_adm_account`)
            REFERENCES `reporteria-test`.`adm_accounts` (`id`)
            ON DELETE CASCADE
            ON UPDATE NO ACTION
)
    ENGINE = InnoDB;

drop table adm_report_groups;

insert into adm_report_groups (code, name, id_adm_account)
values ('RPDD', 'Dev Digital', 1),
       ('RPBB', 'Brilliant Brothers', 1),
       ('RPCI', 'Creative Ideas', 1),
       ('RPEM', 'Ember Media', 1);

select id_adm_report_groups reportGroupId, code, name, active, 0 sections
from adm_report_groups reportGroups
where reportGroups.id_adm_account = 1;

-- Crear tabla de workspaces (adm_account_workspaces)
CREATE TABLE IF NOT EXISTS `reporteria-test`.`adm_account_workspaces`
(
    `id_workspace`    VARCHAR(45) NOT NULL,
    `id_adm_accounts` INT         NOT NULL,
    PRIMARY KEY (`id_workspace`, `id_adm_accounts`),
    INDEX `fk_adm_account_workspaces_adm_accounts1_idx` (`id_adm_accounts` ASC) VISIBLE,
    CONSTRAINT `fk_adm_account_workspaces_adm_accounts1`
        FOREIGN KEY (`id_adm_accounts`)
            REFERENCES `reporteria-test`.`adm_accounts` (`id`)
            ON DELETE CASCADE
            ON UPDATE NO ACTION
)
    ENGINE = InnoDB;

insert into adm_account_workspaces (id_adm_accounts, id_workspace)
values (1, 'f215dfe5-f4a3-44cc-a0f5-fa3de238411e');

-- Crear tabla de reportes (adm_account_reports)
-- esta tabla se llena via backend con report.services#reconcileReports()
CREATE TABLE IF NOT EXISTS `reporteria-test`.`adm_account_reports`
(
    `id_report`       VARCHAR(45) NOT NULL,
    `id_workspace`    VARCHAR(45) NOT NULL,
    `id_adm_accounts` INT         NOT NULL,
    `active`          TINYINT(1)  NOT NULL DEFAULT 1,
    PRIMARY KEY (`id_report`),
    INDEX `fk_adm_account_reports_adm_account_workspaces1_idx` (`id_workspace` ASC) VISIBLE,
    INDEX `fk_adm_account_reports_adm_account_workspaces2_idx` (`id_adm_accounts` ASC) VISIBLE,
    CONSTRAINT `fk_adm_account_reports_adm_account_workspaces1`
        FOREIGN KEY (`id_workspace`)
            REFERENCES `reporteria-test`.`adm_account_workspaces` (`id_workspace`)
            ON DELETE CASCADE
            ON UPDATE NO ACTION,
    CONSTRAINT `fk_adm_account_reports_adm_account_workspaces2`
        FOREIGN KEY (`id_adm_accounts`)
            REFERENCES `reporteria-test`.`adm_account_workspaces` (`id_adm_accounts`)
            ON DELETE CASCADE
            ON UPDATE NO ACTION
)
    ENGINE = InnoDB;

-- Crear tabla de secciones
-- esta tabla se llena via backend con section.services#reconcileSections()
drop table `reporteria-test`.`adm_account_sections`;

CREATE TABLE IF NOT EXISTS `reporteria-test`.`adm_account_sections`
(
    `id_section`      VARCHAR(45) NOT NULL,
    `id_report`       VARCHAR(45) NOT NULL,
    `id_adm_accounts` INT         NOT NULL,
    PRIMARY KEY (`id_section`, `id_report`),
    INDEX `fk_adm_account_sections_adm_account_reports1_idx` (`id_report` ASC) VISIBLE,
    INDEX `fk_adm_account_sections_adm_accounts1_idx` (`id_adm_accounts` ASC) VISIBLE,
    CONSTRAINT `fk_adm_account_sections_adm_account_reports1`
        FOREIGN KEY (`id_report`)
            REFERENCES `reporteria-test`.`adm_account_reports` (`id_report`)
            ON DELETE CASCADE
            ON UPDATE NO ACTION,
    CONSTRAINT `fk_adm_account_sections_adm_accounts1`
        FOREIGN KEY (`id_adm_accounts`)
            REFERENCES `reporteria-test`.`adm_accounts` (`id`)
            ON DELETE CASCADE
            ON UPDATE NO ACTION
)
    ENGINE = InnoDB;

-- Crear tabla de account_has_report_groups (N:M)
-- tomar en cuenta que la fk hacia adm_account_sections es (id_section, id_report)
-- esto es porque hay reportes con id duplicadas...
drop table account_has_report_groups;

CREATE TABLE IF NOT EXISTS `reporteria-test`.`account_has_report_groups`
(
    `id_adm_report_groups` INT         NOT NULL,
    `id_section`           VARCHAR(45) NOT NULL,
    `id_report`            VARCHAR(45) NOT NULL,
    PRIMARY KEY (`id_adm_report_groups`, `id_section`, `id_report`),
    INDEX `fk_account_has_report_groups_adm_account_sections1_idx` (`id_section` ASC, `id_report` ASC) VISIBLE,
    CONSTRAINT `fk_account_has_report_groups_adm_report_groups1`
        FOREIGN KEY (`id_adm_report_groups`)
            REFERENCES `reporteria-test`.`adm_report_groups` (`id_adm_report_groups`)
            ON DELETE CASCADE
            ON UPDATE NO ACTION,
    CONSTRAINT `fk_account_has_report_groups_adm_account_sections1`
        FOREIGN KEY (`id_section`, `id_report`)
            REFERENCES `reporteria-test`.`adm_account_sections` (`id_section`, `id_report`)
            ON DELETE CASCADE
            ON UPDATE NO ACTION
)
    ENGINE = InnoDB;

-- Cargar con valores
INSERT INTO `reporteria-test`.account_has_report_groups (id_section, id_report, id_adm_report_groups)
VALUES ('ReportSection', 'aa463810-c45c-4cab-a926-0ed948d7c62a', 1),
       ('ReportSection04678ff22cb86446142d', 'aa463810-c45c-4cab-a926-0ed948d7c62a', 1),
       ('ReportSection11c5452bde09c79a841f', '3d400a97-263a-44cc-be15-18da5bfdcb54', 1),
       ('ReportSection56773de18c1a459d9192', '78d5c957-5e39-453b-a4af-5c3aea37eaaa', 1),
       ('ReportSection7fba48c06b07714cb169', '948b1e91-c8c6-4930-8604-b6d38a5e16a5', 2),
       ('ReportSection98ceb79bc32f027d9868', '81ebe83e-bc4f-40d4-8cf5-36acf3fc3a48', 2),
       ('ReportSectionaa0f963ffd4f967cee0e', '3d400a97-263a-44cc-be15-18da5bfdcb54', 2),
       ('ReportSectionabc88ac6a834bda0cda2', '3d400a97-263a-44cc-be15-18da5bfdcb54', 3),
       ('ReportSectionbcdb9758590becaa911a', '78d5c957-5e39-453b-a4af-5c3aea37eaaa', 3),
       ('ReportSectionbcdb9758590becaa911a', '948b1e91-c8c6-4930-8604-b6d38a5e16a5', 4),
       ('ReportSectionbfb832bd70ddc4ec3957', '78d5c957-5e39-453b-a4af-5c3aea37eaaa', 4),
       ('ReportSectiondd7961012ad11b72c856', '948b1e91-c8c6-4930-8604-b6d38a5e16a5', 4),
       ('ReportSectiondecccb8482fa6cf4f797', '81ebe83e-bc4f-40d4-8cf5-36acf3fc3a48', 4),
       ('ReportSectionea43c9819afbdd46884e', '3d400a97-263a-44cc-be15-18da5bfdcb54', 4);

-- Ahora con los usuarios
drop table adm_users_reports_groups;

-- Crear tabla de asociación
CREATE TABLE IF NOT EXISTS `reporteria-test`.`users_have_report_groups`
(
    `id_user`         INT NOT NULL,
    `id_report_group` INT NOT NULL,
    PRIMARY KEY (`id_user`, `id_report_group`),
    INDEX `fk_adm_users_has_adm_report_groups_adm_report_groups1_idx` (`id_report_group` ASC) VISIBLE,
    INDEX `fk_adm_users_has_adm_report_groups_adm_users1_idx` (`id_user` ASC) VISIBLE,
    CONSTRAINT `fk_adm_users_has_adm_report_groups_adm_users1`
        FOREIGN KEY (`id_user`)
            REFERENCES `reporteria-test`.`adm_users` (`id`)
            ON DELETE CASCADE
            ON UPDATE NO ACTION,
    CONSTRAINT `fk_adm_users_has_adm_report_groups_adm_report_groups1`
        FOREIGN KEY (`id_report_group`)
            REFERENCES `reporteria-test`.`adm_report_groups` (`id_adm_report_groups`)
            ON DELETE CASCADE
            ON UPDATE NO ACTION
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8;

insert into users_have_report_groups (id_user, id_report_group)
values (1, 1),
       (1, 2),
       (1, 3),
       (2, 1),
       (2, 3),
       (2, 4),
       (6, 4),
       (6, 3),
       (6, 2),
       (6, 1);

select *
from users_have_report_groups;

select user.id, user.username, user.name, user.mail, user.active
from adm_users user,
     adm_accounts admin
where user.id_adm_accounts = admin.id
  and admin.id = 1;

select user.id userId, reportGroup.id_adm_report_groups reportGroupId
from adm_users user,
     adm_accounts admin,
     users_have_report_groups has,
     adm_report_groups reportGroup
where has.id_user = user.id
  and has.id_report_group = reportGroup.id_adm_report_groups
  and user.id_adm_accounts = admin.id
  and admin.id = ?;

delete from adm_users where id > 20;