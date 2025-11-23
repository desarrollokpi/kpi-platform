exports.READ_WORKSPACES_BY_ADMIN = `
select id_workspace as workspaceId
from adm_account_workspaces
where id_adm_accounts = ?
`

exports.READ_WORKSPACES_BY_USER = `
select distinct report.id_workspace workspaceId
from adm_users user,
     users_have_report_groups user_has_reportGroups,
     adm_report_groups reportGroup,
     report_groups_have_sections reportGroup_has_sections,
     adm_account_sections section,
     adm_account_reports report
where user.id = user_has_reportGroups.id_user
  and reportGroup.id_adm_report_groups = user_has_reportGroups.id_report_group
  and reportGroup_has_sections.id_adm_report_groups = reportGroup.id_adm_report_groups
  and section.id_section = reportGroup_has_sections.id_section
  and reportGroup_has_sections.id_report = section.id_report
  and section.id_report = report.id_report
  and user.id = ?;
`
