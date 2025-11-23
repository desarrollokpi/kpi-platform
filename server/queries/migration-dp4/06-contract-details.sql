-- elimina el not null para contract_cost
SET FOREIGN_KEY_CHECKS = 0;
alter table adm_account_contract_detail
    change contract_cost contract_cost decimal(15, 3),
    change active active tinyint not null default 1;

alter table adm_invoices_body
    drop foreign key adm_account_contract_detail_body;

-- bajo ningún argumento le vayas a cambiar el orden a este script
alter table adm_account_contract_detail
    change id id int(11) auto_increment;

alter table adm_invoices_body
    add constraint adm_account_contract_detail_body foreign key (id_adm_account_contract_detail)
    references adm_account_contract_detail(id);

delimiter $$
create trigger tr__amd_account_contract_detail__add_up_date
    before insert on adm_account_contract_detail for each row
    begin
        set new.up_date = current_date();
    end $$
delimiter ;

delimiter $$
create trigger tr__amd_account_contract_detail__update_contract_date
    before update on adm_account_contract_detail for each row
    begin
        update adm_account_contract
        set updated_at = current_date()
        where id = new.id_adm_account_contract;
    end $$
delimiter ;

insert into adm_account_contract_detail (id_adm_account_contract, id_int_items, quantity)
values
    (1, 1, 5),
    (1, 2, 3),
    (1, 3, 1),
    (1, 5, 2);

update adm_account_contract_detail
set quantity = 6.5
where id = 1;
SET FOREIGN_KEY_CHECKS = 1;