-- elimina fk a adm_money
-- este valor se consigue via adm_account_contract / int_id_type / adm_money
alter table adm_invoices_header
    drop foreign key adm_money,
    drop index adm_money_idx,
    drop id_adm_money;

