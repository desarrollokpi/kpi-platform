exports.CREATE_REPORT_BY_ADMIN = `
insert into adm_account_reports (id_report, id_workspace, id_adm_accounts) 
values (?, ?, ?)
`;

exports.CREARE_REPORT_GROUP_BY_ADMIN = `
insert into adm_report_groups (id_adm_account, code, name, active)
values (?, ?, ?, ?)
`;

exports.CREATE_SECTIONS_IN_REPORT_GROUP = `
insert into report_groups_have_sections (id_adm_report_groups, id_section, id_report)
values ?
`;

exports.READ_REPORTS_BY_ADMIN = `
select id_report reportId, id_workspace workspaceId, active
from adm_account_reports
where id_adm_accounts = ?
`;

exports.READ_REPORTS_BY_USER = `
select distinct section.id_report reportId
from adm_users user,
     users_have_report_groups user_has_reportGroups,
     adm_report_groups reportGroup,
     report_groups_have_sections reportGroup_has_sections,
     adm_account_sections section
where user.id = user_has_reportGroups.id_user
  and reportGroup.id_adm_report_groups = user_has_reportGroups.id_report_group
  and reportGroup_has_sections.id_adm_report_groups = reportGroup.id_adm_report_groups
  and section.id_section = reportGroup_has_sections.id_section
  and reportGroup_has_sections.id_report = section.id_report
  and user.id = ?
`;

exports.READ_REPORT_GROUPS_BY_ADMIN = `
select id_adm_report_groups id, code, name, active, 0 sections
from adm_report_groups reportGroups
where reportGroups.id_adm_account = ?;
`;

exports.READ_USERS_REPORTS_BY_ADMIN = `
select user.id userId, reportGroup.id_adm_report_groups reportGroupId
from adm_users user,
     adm_accounts admin,
     users_have_report_groups has,
     adm_report_groups reportGroup
where has.id_user = user.id
  and has.id_report_group = reportGroup.id_adm_report_groups
  and user.id_adm_accounts = admin.id
  and admin.id = ?;
`;

exports.UPDATE_REPORT_GROUP_BY_ADMIN = `
update adm_report_groups
set code = ?, name = ?, active = ?
where id_adm_account = ? and id_adm_report_groups = ?;
`;

exports.UPDATE_REPORT_ACTIVE_STATE_BY_ADMIN = `
update adm_account_reports
set active = ?
where id_adm_accounts = ? and id_report = ? and id_workspace = ?;
`;

exports.DELETE_REPORT_BY_ADMIN = `
delete from adm_account_reports
where id_report = ? and id_workspace = ? and id_adm_accounts = ?
`;

exports.DELETE_SECTIONS_IN_REPORT_GROUP = `
delete
from report_groups_have_sections
where id_adm_report_groups = ?;
`;
