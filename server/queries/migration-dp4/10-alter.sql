SET FOREIGN_KEY_CHECKS = 0;

alter table int_id_type
add constraint fk__int_id_type__adm_money foreign key (id_adm_money) references adm_money(id);

SET FOREIGN_KEY_CHECKS = 1;