-- esta es la configuración inicial de esta tabla
-- para el requerimiento solicitado la misma ya no se muestra así
-- según el modelo de BD

CREATE TABLE `adm_account_contract` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_adm_accounts` int(11) NOT NULL,
  `id_int_id_type` int(11) NOT NULL,
  `int_id_type_value` varchar(45) NOT NULL,
  `address` varchar(100) DEFAULT NULL,
  `id_geo_zone` int(11) NOT NULL,
  `monthly_value` decimal(15,3) NOT NULL,
  `id_adm_money_monthly_value` int(11) NOT NULL,
  `active_user_value` decimal(15,3) NOT NULL,
  `id_adm_money_active_user_value` int(11) NOT NULL,
  `inactive_user_value` decimal(15,3) NOT NULL,
  `id_adm_money_inactive_user_value` int(11) NOT NULL,
  `active` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `adm_accounts_idx` (`id_adm_accounts`),
  KEY `int_id_type_idx` (`id_int_id_type`),
  KEY `geo_zone_idx` (`id_geo_zone`),
  KEY `adm_money_monthly_idx` (`id_adm_money_monthly_value`),
  KEY `dam_money_active_user_idx` (`id_adm_money_active_user_value`),
  KEY `adm_money_inactive_user_idx` (`id_adm_money_inactive_user_value`),
  CONSTRAINT `fk__adm_accounts_billings__adm_accounts` FOREIGN KEY (`id_adm_accounts`) REFERENCES `adm_accounts` (`id`),
  CONSTRAINT `fk__adm_accounts_billings__adm_money__active_user` FOREIGN KEY (`id_adm_money_active_user_value`) REFERENCES `adm_money` (`id`),
  CONSTRAINT `fk__adm_accounts_billings__adm_money__inactive_user` FOREIGN KEY (`id_adm_money_inactive_user_value`) REFERENCES `adm_money` (`id`),
  CONSTRAINT `fk__adm_accounts_billings__adm_money__monthly` FOREIGN KEY (`id_adm_money_monthly_value`) REFERENCES `adm_money` (`id`),
  CONSTRAINT `fk__adm_accounts_billings__geo_zone` FOREIGN KEY (`id_geo_zone`) REFERENCES `geo_zone` (`id`),
  CONSTRAINT `fk__adm_accounts_billings__int_id_type` FOREIGN KEY (`id_int_id_type`) REFERENCES `int_id_type` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8