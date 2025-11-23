-- Revisar este archvio porque es posible que haya un problema de análisis para esto

set global log_bin_trust_function_creators = 1;

DELIMITER $$
create function generate_date(days int)
    returns datetime
begin
    return date_add(now(), interval days day);
end $$
DELIMITER ;

-- el producto 1 tiene dos precios, pero justamente uno ya venció
-- el producto igual
-- faltan productos desde id = 8 hasta id = 11, lo cual es adrede
-- el producto 6 no se debe cargar porque no esta activo
insert into adm_items_standard_costs (id_int_items, id_geo_countries, up_date, down_date, standard_cost)
values (1, 1, generate_date(-30), generate_date(-10), 1.25),
       (1, 1, generate_date(0), generate_date(30), 5),
       (2, 1, generate_date(-10), generate_date(30), 1),
       (3, 1, generate_date(-10), generate_date(30), 0.3),
       (4, 1, generate_date(-10), generate_date(30), 3),
       (4, 1, generate_date(-30), generate_date(-10), 5),
       (5, 1, generate_date(-30), generate_date(30), 2),
       (6, 1, generate_date(-30), generate_date(30), 2.5),
       (7, 1, generate_date(-30), generate_date(30), 0.75);

insert into adm_money (code, name, active)
values ('UF', 'Unidad de fomento', 1);

-- en bd se muestra un campo id_adm_money, el cual no aparece en el create table
insert into int_id_type (type, validate_function, id_int_countries)
values ('RUT', 'RUT', 1);
