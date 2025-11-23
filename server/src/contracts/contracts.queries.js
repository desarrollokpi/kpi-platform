exports.CREATE_CONTRACT_BY_ADMIN = `
insert into adm_account_contract (id_adm_accounts, id_int_id_type, int_id_type_value, address, id_geo_zone, name)
values (?, ?, ?, ?, ?, ?);
`

exports.CREATE_CONTRACT_DETAILS_BY_ADMIN = `
insert into adm_account_contract_detail (id_adm_account_contract, id_int_items, quantity)
values ?
`

exports.UPDATE_CONTRACT_DETAIL_BY_ADMIN = `
update adm_account_contract_detail
set quantity = ?
where id = ?;
`

exports.UPDATE_CONTRACT_BY_ADMIN = `
update adm_account_contract
set id_int_id_type = ?, int_id_type_value = ?, address = ?, id_geo_zone = ?, name = ?
where id = ?
`

exports.READ_CONTRACT_BY_ADMIN = `
select c.name,
       c.id, 
       address,
       created_at,
       updated_at,
       id_int_id_type as identificationDocumentId,
       int_id_type_value identificationDocumentValue,
       gz.id          as zoneId,
       gr.id          as regionId,
       gc.id          as countryId,
       mo.id           as currencyId
from adm_account_contract c,
     geo_zone gz,
     geo_region gr,
     geo_countries gc,
     int_id_type id_doc,
     adm_money mo
where gz.id = c.id_geo_zone
  and gr.id = gz.id_geo_region
  and gc.id = gr.id_geo_countries
  and gc.id = id_doc.id_int_countries
  and mo.id = id_doc.id_adm_money
  and id_adm_accounts = ?;
`

exports.READ_CONTRACT_DETAILS_BY_ADMIN = `
call sp_contract_details_by_admin(?, ?)
`
