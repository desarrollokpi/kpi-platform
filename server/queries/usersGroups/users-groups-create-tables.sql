CREATE TABLE IF NOT EXISTS `reporteria-test`.`adm_users_groups` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(45) NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `active` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `reporteria-test`.`adm_users_groups_has_users` (
  `id_adm_users_groups` INT NOT NULL,
  `id_adm_users_id` INT NOT NULL,
  PRIMARY KEY (`id_adm_users_groups`, `id_adm_users_id`),
  INDEX `fk_adm_users_groups_has_adm_users_adm_users1_idx` (`id_adm_users_id` ASC) VISIBLE,
  INDEX `fk_adm_users_groups_has_adm_users_adm_users_groups1_idx` (`id_adm_users_groups` ASC) VISIBLE,
  CONSTRAINT `fk_adm_users_groups_has_adm_users_adm_users_groups1`
    FOREIGN KEY (`id_adm_users_groups`)
    REFERENCES `reporteria-test`.`adm_users_groups` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_adm_users_groups_has_adm_users_adm_users1`
    FOREIGN KEY (`id_adm_users_id`)
    REFERENCES `reporteria-test`.`adm_users` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `reporteria-test`.`adm_users_groups_has_reports_groups_headers` (
  `id_adm_users_groups` INT NOT NULL,
  `id_pbi_reports_groups_headers` INT NOT NULL,
  PRIMARY KEY (`id_adm_users_groups`, `id_pbi_reports_groups_headers`),
  INDEX `fk_adm_users_groups_has_pbi_reports_groups_headers_pbi_repo_idx` (`id_pbi_reports_groups_headers` ASC) VISIBLE,
  INDEX `fk_adm_users_groups_has_pbi_reports_groups_headers_adm_user_idx` (`id_adm_users_groups` ASC) VISIBLE,
  CONSTRAINT `fk_adm_users_groups_has_pbi_reports_groups_headers_adm_users_1`
    FOREIGN KEY (`id_adm_users_groups`)
    REFERENCES `reporteria-test`.`adm_users_groups` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_adm_users_groups_has_pbi_reports_groups_headers_pbi_report1`
    FOREIGN KEY (`id_pbi_reports_groups_headers`)
    REFERENCES `reporteria-test`.`pbi_reports_groups_headers` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `reporteria-test`.`adm_users_groups_has_workspaces_reports_sections` (
  `id_adm_users_groups` INT NOT NULL,
  `id_pbi_workspaces_reports_sections` INT NOT NULL,
  PRIMARY KEY (`id_adm_users_groups`, `id_pbi_workspaces_reports_sections`),
  INDEX `fk_adm_users_groups_has_pbi_workspaces_reports_sections_pbi_idx` (`id_pbi_workspaces_reports_sections` ASC) VISIBLE,
  INDEX `fk_adm_users_groups_has_pbi_workspaces_reports_sections_adm_idx` (`id_adm_users_groups` ASC) VISIBLE,
  CONSTRAINT `fk_adm_users_groups_has_pbi_workspaces_reports_sections_adm_u1`
    FOREIGN KEY (`id_adm_users_groups`)
    REFERENCES `reporteria-test`.`adm_users_groups` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_adm_users_groups_has_pbi_workspaces_reports_sections_pbi_w1`
    FOREIGN KEY (`id_pbi_workspaces_reports_sections`)
    REFERENCES `reporteria-test`.`pbi_workspaces_reports_sections` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;