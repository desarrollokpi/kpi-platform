-- 1) Se crea la tabla de términos y condiciones
create table if not exists `reporteria-test`.`adm_terms_and_conditions`
(
    `id`         int         not null auto_increment,
    `body`       mediumtext  not null,
    `version`    varchar(10) not null unique,
    `created_at` date        not null not null,

    constraint pk__terms_and_conditions primary key (id)
);

-- 2) Asignar una fecha default para created_at, con la función now()
create trigger tr__adm_terms_and_conditions__set_created_at
    before insert
    on adm_terms_and_conditions
    for each row
begin
    set new.created_at = current_timestamp();
end;

-- 3) Crear la tabla n:n donde se guarda si el user aceptó los tyc (términos y condiciones)
CREATE TABLE IF NOT EXISTS `reporteria-test`.`adm_accounts_has_adm_terms_and_conditions`
(
    `id_adm_accounts`             INT NOT NULL,
    `id_adm_terms_and_conditions` INT NOT NULL,
    PRIMARY KEY (`id_adm_accounts`, `id_adm_terms_and_conditions`),
    CONSTRAINT `fk_adm_accounts_has_adm_terms_and_conditions_adm_accounts1`
        FOREIGN KEY (`id_adm_accounts`)
            REFERENCES `reporteria-test`.`adm_accounts` (`id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,
    CONSTRAINT `fk_adm_accounts_has_adm_terms_and_conditions_adm_terms_and_co1`
        FOREIGN KEY (`id_adm_terms_and_conditions`)
            REFERENCES `reporteria-test`.`adm_terms_and_conditions` (`id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8;

-- 4) Se inserta la version 1.0 de los tyc. Esto está en otro archivo porque es muy largo
-- el archivo es: legal-body-1.sql

insert into adm_accounts_has_adm_terms_and_conditions (id_adm_accounts, id_adm_terms_and_conditions)
values (1, 1);

select *
from adm_accounts_has_adm_terms_and_conditions;

delete
from adm_accounts_has_adm_terms_and_conditions
where id_adm_terms_and_conditions = 4;

select wr.id, w.name as workspace, wr.name as name, wr.active, w.id_pbi as groupId, wr.id_pbi as reportId
from pbi_reports_groups_headers gh,
     adm_accounts a,
     pbi_reports_groups_body gb,
     pbi_workspaces_reports_sections rs,
     pbi_workspaces_reports wr,
     pbi_workspaces w
where a.id = gh.id_adm_accounts
  and gh.id = gb.id_pbi_reports_groups_headers
  and rs.id = gb.id_pbi_workspaces_reports_sections
  and wr.id = rs.id_pbi_workspaces_reports
  and w.id = wr.id_pbi_workspaces

  and a.id = ?
group by wr.id;

insert into pbi_reports_groups_body (id_pbi_reports_groups_headers, id_pbi_workspaces_reports_sections,
                                     id_adm_accounts_reports)
values (?, ?, fn_get_id_adm_account_reports_by_section_id(?))

select * from adm_accounts_has_adm_terms_and_conditions;