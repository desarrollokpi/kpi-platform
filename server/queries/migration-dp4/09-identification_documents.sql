-- hay que agregar una fk hacia adm_money
-- primero se agrega la columna
alter table int_id_type
    add column id_adm_money int(11) not null;

insert into adm_money (code, name, active)
values ('VEF', 'Venezuelan Bolivar', 0),
       ('EUR', 'Euro', 1);

insert into int_id_type (type, validate_function, id_int_countries, id_adm_money)
values
    ('DNI', 'DNI', 3, 3),
    ('CI', 'CI', 2, 2);

update int_id_type
set id_adm_money = 1
where id = 1;