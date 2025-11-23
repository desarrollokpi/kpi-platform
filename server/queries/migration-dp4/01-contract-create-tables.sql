-- 23 ene 2022
-- Estas son las tablas que no fueron implementadas al momento de Roberto darme el proyecto
-- Por eso están acá todas las create tables

-- adm_estados_pago
CREATE TABLE IF NOT EXISTS `adm_estados_pago` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  `estado` TINYINT(1) NOT NULL,
  PRIMARY KEY (`id`));

-- adm_invoices_header
CREATE TABLE IF NOT EXISTS `adm_invoices_header` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `invoice_id` VARCHAR(45) NOT NULL,
  `id_adm_account_contract` INT NULL,
  `id_adm_money` INT NOT NULL,
  `value` DECIMAL(15,3) NOT NULL,
  `date_creation` DATE NOT NULL,
  `date_payment` DATE NOT NULL,
  `id_adm_estados_pago` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `adm_account_contract_idx` (`id_adm_account_contract` ASC),
  INDEX `adm_money_idx` (`id_adm_money` ASC),
  INDEX `adm_esatdos_pago_idx` (`id_adm_estados_pago` ASC),
  CONSTRAINT `adm_account_contract`
    FOREIGN KEY (`id_adm_account_contract`)
    REFERENCES `adm_account_contract` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `adm_money`
    FOREIGN KEY (`id_adm_money`)
    REFERENCES `adm_money` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `adm_esatdos_pago`
    FOREIGN KEY (`id_adm_estados_pago`)
    REFERENCES `adm_estados_pago` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

-- int_items
CREATE TABLE IF NOT EXISTS `int_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `estado` TINYINT(1) NOT NULL,
  PRIMARY KEY (`id`));

-- adm_items_standar_costs
CREATE TABLE IF NOT EXISTS `adm_items_standard_costs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_int_items` INT NOT NULL,
  `id_geo_countries` INT NULL,
  `up_date` DATE NOT NULL,
  `down_date` DATE NOT NULL,
  `standard_cost` DECIMAL(15,3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `int_items_idx` (`id_int_items` ASC),
  INDEX `geo_countries_idx` (`id_geo_countries` ASC),
  CONSTRAINT `int_items`
    FOREIGN KEY (`id_int_items`)
    REFERENCES `int_items` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `geo_countries`
    FOREIGN KEY (`id_geo_countries`)
    REFERENCES `geo_countries` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

-- adm_account_contract_detail
CREATE TABLE IF NOT EXISTS `adm_account_contract_detail` (
  `id` INT NOT NULL,
  `id_adm_account_contract` INT NOT NULL,
  `id_int_items` INT NOT NULL,
  `quantity` DECIMAL(15,3) NOT NULL,
  `standard_cost` DECIMAL(15,3) NULL,
  `contract_cost` DECIMAL(15,3) NOT NULL,
  `up_date` DATE NOT NULL,
  `down_date` DATE NULL,
  `active` TINYINT(1) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `adm_account_contract_idx` (`id_adm_account_contract` ASC),
  INDEX `int_items_idx` (`id_int_items` ASC),
  CONSTRAINT `adm_account_contract_detail`
    FOREIGN KEY (`id_adm_account_contract`)
    REFERENCES `adm_account_contract` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `int_items_detail`
    FOREIGN KEY (`id_int_items`)
    REFERENCES `int_items` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

-- adm_invoices_body
CREATE TABLE IF NOT EXISTS `adm_invoices_body` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_adm_invoices_header` INT NOT NULL,
  `id_int_items` INT NOT NULL,
  `id_adm_account_contract_detail` INT NOT NULL,
  `quantity` DECIMAL(15,3) NOT NULL,
  `contract_cost` DECIMAL(15,3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `adm_invoices_header_idx` (`id_adm_invoices_header` ASC),
  INDEX `int_items_idx` (`id_int_items` ASC),
  INDEX `adm_account_contract_detail_idx` (`id_adm_account_contract_detail` ASC),
  CONSTRAINT `adm_invoices_header`
    FOREIGN KEY (`id_adm_invoices_header`)
    REFERENCES `adm_invoices_header` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `int_items_body`
    FOREIGN KEY (`id_int_items`)
    REFERENCES `int_items` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `adm_account_contract_detail_body`
    FOREIGN KEY (`id_adm_account_contract_detail`)
    REFERENCES `adm_account_contract_detail` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);