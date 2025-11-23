-- Se puede bver fat, pero este archivo solo:
-- 1  Modifica nombres de FKs
-- 2  Cambia unas columnas en tablas
-- 3  Agrega UN solo contrato

alter table adm_account_contract
    change adress address varchar(100),

    -- drop foreign key fk__adm_accounts_billings__adm_account,
    -- drop foreign key fk__adm_accounts_billings__adm_money__monthly,
    drop foreign key fk__adm_accounts_billings__adm_money__inactive_user,
    drop foreign key fk__adm_accounts_billings__adm_money__active_user,
    drop foreign key fk__adm_accounts_billings__adm_money__monthly,
    drop foreign key fk__adm_accounts_billings__int_id_type,
    drop foreign key fk__adm_accounts_billings__geo_zone,

    drop monthly_value,
    drop id_adm_money_monthly_value,
    drop active_user_value,
    drop id_adm_money_active_user_value,
    drop inactive_user_value,
    drop id_adm_money_inactive_user_value,

    add column name varchar(100),
    add column created_at date not null,
    add column updated_at date not null,

    change active active tinyint default 1,

    add constraint fk__account_contract__adm_accounts foreign key (id_adm_accounts) references adm_accounts (id),
    add constraint fk__account_contract__int_id_type foreign key (id_int_id_type) references int_id_type (id),
    add constraint fk__account_contract__geo_zone foreign key (id_geo_zone) references geo_zone (id);

SET FOREIGN_KEY_CHECKS = 0;
insert into adm_account_contract (id_adm_accounts, id_int_id_type, int_id_type_value, address, id_geo_zone, name)
values (1, 1, '28615208', 'Calle A, Altos de B, Edificio C', 72, 'Contrato ABC');
SET FOREIGN_KEY_CHECKS = 1;


delimiter $$
create trigger tr__adm_account_contract__set_dates
    before insert on adm_account_contract for each row
    begin
        set new.created_at = current_date();
        set new.updated_at = current_date();
    end $$
delimiter ;

delimiter $$
create trigger tr__adm_account_contract__set_updated_at
    before update on adm_account_contract for each row
    begin
        set new.updated_at = current_date();
    end $$
delimiter ;