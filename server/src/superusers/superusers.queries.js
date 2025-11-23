exports.READ_PROFILE = `
select id, name
from adm_superusers
where id = ?
`

exports.READ_BY_NAME = `
select id, password, name
from adm_superusers
where name = ?
`
