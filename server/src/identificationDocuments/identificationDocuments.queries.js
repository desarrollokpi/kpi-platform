exports.READ_IDENTIFICATION_DOCUMENTS = `
select id, type, validate_function as validateFunction, id_int_countries as countryId, id_adm_money as currencyId
from int_id_type;
`
