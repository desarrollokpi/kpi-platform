exports.READ_COUNTRIES = `
select *
from geo_countries;
`

exports.READ_REGIONS = `
select id, id_geo_countries as countryId, name
from geo_region;
`

exports.READ_ZONES = `
select id, id_geo_region as regionId, name
from geo_zone;
`
