exports.READ_PROFILE = `
select id, name, sub_domain as 'subdomain', data_base as 'dataBase', key_user as 'keyUser', active, password, logo_address as logoAddress
from adm_accounts where id = ?;
`

exports.READ_BY_NAME = `
select id, name, sub_domain as 'subdomain', data_base as 'dataBase', key_user as 'keyUser', active, password
from adm_accounts where name = ?;
`

exports.READ_ADMINS_BY_SUPERUSER = `
select id, name, sub_domain subdomain, key_user keyUser, active
from adm_accounts;
`

exports.UPDATE_LOGO = `
update adm_accounts
set logo_address = ?
where id = ?;
`

exports.READ_LOGO_BY_SUBDOMAIN = `
select logo_address as logoAddress
from adm_accounts
where sub_domain = ?
`

exports.READ_ADMIN_TERMS_AND_CONDITIONS = `
select tac.id
from adm_accounts_has_adm_terms_and_conditions accepted, adm_accounts admin, adm_terms_and_conditions tac
where admin.id = accepted.id_adm_accounts and tac.id = accepted.id_adm_terms_and_conditions
and admin.id = ?;
`

exports.ACCEPT_TERMS_AND_CONDITIONS = `
insert into adm_accounts_has_adm_terms_and_conditions (id_adm_accounts, id_adm_terms_and_conditions)
values (?, ?);
`

exports.UPDATE_PASSWORD = `
update adm_accounts
set password = ?
where id = ?
`

exports.UPDATE_USER_PASSWORD = `
update adm_users
set password = ?
where id = ?
`

exports.READ_SUBDOMAINS = `
select sub_domain as subdomain
from adm_accounts
`
