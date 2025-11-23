-- selecciona regiones por id de country
select r.id, r.name, c.id as countryId
from geo_region r, geo_countries c
where c.id = r.id_geo_countries;

select z.id, z.name, id_geo_region as regionId
from geo_zone z, geo_region r
where r.id = z.id_geo_region;

-- selecciona countries
select *
from geo_countries;

select id, id_geo_countries as countryId, name
from geo_region;

select id, id_geo_region as regionId, name
from geo_zone;