exports.CREATE_REPORT_GROUPS_IN_USER = `
insert into users_have_report_groups (id_user, id_report_group)
values ?
`

exports.READ_PROFILE = `
select user.id, username, user.name, mail, user.active, admin.id adminId
from adm_users user,
     adm_accounts admin
where admin.id = user.id_adm_accounts
  and user.id = ?
`

exports.READ_USERS_BY_ADMIN_ID = `
select user.id, user.username, user.name, user.mail, user.active
from adm_users user,
     adm_accounts admin
where user.id_adm_accounts = admin.id
  and admin.id = ?;
`

exports.READ_USER_REPORTS_GROUPS_BY_ADMIN = `
select user.id userId, reportGroup.id_adm_report_groups reportGroupId
from adm_users user,
     adm_accounts admin,
     users_have_report_groups has,
     adm_report_groups reportGroup
where has.id_user = user.id
  and has.id_report_group = reportGroup.id_adm_report_groups
  and user.id_adm_accounts = admin.id
  and admin.id = ?;
`

exports.UPDATE_PASSWORD_BY_USER = `
update adm_users
set password = ?
where id = ?
`

exports.UPDATE_USER_BY_ADMIN = `
update adm_users
set username = ?, name = ?, mail = ?, active = ?
where id = ? and id_adm_accounts = ?;
`

exports.DELETE_REPORT_GROUPS_IN_USER = `
delete
from users_have_report_groups
where id_user = ?;
`

// before refactor

// exports.READ_USERS_BY_ADMIN_ID = `
// select u.id, u.name, username, mail, count(u.name) as 'groups', u.active
// from adm_accounts a, adm_users u, adm_users_reports_groups rp
// where u.id_adm_accounts = a.id
// and u.id = rp.id_adm_users
// and a.id = ?
// group by a.id, u.name, u.username, u.mail, u.active, u.id
// order by a.id;
// `

exports.CREATE_USER_BY_ADMIN = `
insert into adm_users (id_adm_accounts, username, name, mail, password, active)
values (?, ?, ?, ?, ?, ?);
`

exports.CONNECT_USER_TO_REPORT_GROUPS = `
insert into adm_users_reports_groups (id_adm_users, id_pbi_reports_groups_headers)
values ?;
`

exports.DELETE_CONNECTION_USER_TO_REPORT_GROUPS = `
delete from adm_users_reports_groups
where id_adm_users = ?;
`

// exports.READ_USERS_REPORTS_GROUPS_BY_ADMIN = `
// select id_adm_users as userId, id_pbi_reports_groups_headers as reportGroupId
// from adm_users_reports_groups rp, adm_users u, adm_accounts a
// where a.id = u.id_adm_accounts
// and a.id = ?
// group by rp.id_adm_users, rp.id_pbi_reports_groups_headers;
// `

exports.READ_BY_NAME = `
select id, username, name, mail, password, active
from adm_users
where username = ?
`
exports.READ_USERS_WORKSPACE = `
SELECT A.*, B.id_adm_account, B.id_workspace 
FROM adm_accounts AS A 
LEFT JOIN adm_account_workspace AS B 
ON B.id_adm_account = A.id WHERE A.sub_domain = ?
`
