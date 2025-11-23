alter table int_items
change nombre name varchar(100) unique not null;

alter table int_items
change estado status tinyint(1) default 1;

insert into int_items (name)
values
    ('Plataforma'),
    ('Reportes'),
    ('Usuarios'),
    ('Servicio A'),
    ('Servicio B'),
    ('Servicio C'),
    ('Servicio D'),
    ('Servicio F'),
    ('Item X'),
    ('Item Y'),
    ('Item Z');

update int_items
set status = 0 where id = 6;