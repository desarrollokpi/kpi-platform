exports.CREATE_SECTION_BY_ADMIN = `
insert into adm_account_sections (id_adm_accounts, id_section, id_report)
values (?, ?, ?)
`

exports.READ_SECTIONS_BY_REPORT_GROUP = `
select has.id_section sectionId, has.id_report reportId
from report_groups_have_sections has,
     adm_report_groups reportGroup,
     adm_account_sections section
where has.id_adm_report_groups = reportGroup.id_adm_report_groups
  and has.id_report = section.id_report
  and has.id_section = section.id_section
  and reportGroup.id_adm_report_groups = ?;
`

exports.READ_SECTIONS_BY_ADMIN = `
select id_section sectionId, id_report reportId
from adm_account_sections
where id_adm_accounts = ?
`

exports.READ_SECTIONS_BY_USER = `
select section.id_section sectionId,
       section.id_report  reportId
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
  and user.id = ?;
`

exports.DELETE_SECTION_BY_ADMIN = `
delete from adm_account_sections
where id_adm_accounts = ? and id_section = ? and id_report = ?
`

// before refactoring

// exports.READ_SECTIONS_BY_ADMIN = `
// select section.id,
//        report.id_pbi                     as reportIdPBI,
//        section.id_pbi_workspaces_reports as reportId,
//        section.id_pbi                    as pbiSectionId,
//        section.name,
//        report.name                       as reportName,
//        workspace.name                    as workspaceName,
//        report.active                     as reportActive

// from adm_accounts admin,
//      adm_accounts_reports accountsReport,
//      pbi_workspaces_reports report,
//      pbi_workspaces_reports_sections section,
//      pbi_workspaces workspace

// where admin.id = accountsReport.id_adm_accounts
//   and report.id = accountsReport.id_pbi_workspaces_reports
//   and report.id = section.id_pbi_workspaces_reports
//   and report.id_pbi_workspaces = workspace.id
//   and admin.id = ?;
// `
