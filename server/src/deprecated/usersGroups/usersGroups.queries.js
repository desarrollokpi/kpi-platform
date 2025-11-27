exports.READ_USERS_GROUPS = `
select usersGroup.id,
       code,
       usersGroup.name,
       usersGroup.active,
       count(user.id)    as numUsers,
       ceil(rand() * 5) as numSections
from adm_users_groups usersGroup,
     adm_users_groups_has_users usersGroupsHasUser,
     adm_users user,
     adm_accounts admin
where usersGroup.id = usersGroupsHasUser.id_adm_users_groups
  and usersGroupsHasUser.id_adm_users_id = user.id
  and user.id_adm_accounts = admin.id

  and admin.id = ?
group by usersGroup.id;

`;

exports.READ_USERS_GROUPS_USERS = `
select user.id
from adm_users_groups usersGroup,
     adm_users_groups_has_users usersGroupsHasUser,
     adm_users user,
     adm_accounts admin
where usersGroup.id = usersGroupsHasUser.id_adm_users_groups
  and usersGroupsHasUser.id_adm_users_id = user.id
  and user.id_adm_accounts = admin.id

  and admin.id = ? and usersGroup.id = ?;
`;

exports.READ_USERS_GROUPS_REPORTS_GROUPS = `
select groupsHeader.id
from adm_users_groups usersGroup,
     adm_users_groups_has_reports_groups_headers usersGroupsHasReportsGroup,
     pbi_reports_groups_headers groupsHeader,
     adm_accounts admin
where usersGroup.id = usersGroupsHasReportsGroup.id_adm_users_groups
and usersGroupsHasReportsGroup.id_pbi_reports_groups_headers = groupsHeader.id
and groupsHeader.id_adm_accounts = admin.id

and admin.id = ? and usersGroup.id = ?;
`;

exports.READ_USERS_GROUPS_SECTIONS = `
select section.id

from adm_users_groups usersGroup,
     adm_users_groups_has_workspaces_reports_sections usersGroupHasSection,
     pbi_workspaces_reports_sections section,
     pbi_workspaces_reports report,
     adm_accounts_reports accountsReport,
     adm_accounts admin

where usersGroup.id = usersGroupHasSection.id_adm_users_groups
  and usersGroupHasSection.id_pbi_workspaces_reports_sections = section.id
  and section.id_pbi_workspaces_reports = report.id
  and accountsReport.id_pbi_workspaces_reports = report.id
  and accountsReport.id_adm_accounts = admin.id

  and admin.id = ?
  and usersGroup.id = ?;
`;

exports.READ_INDEPENDENT_SECTIONS_IDS = `
select distinct section.id
from pbi_workspaces_reports_sections section,
     pbi_reports_groups_body groupsBody,
     pbi_reports_groups_headers groupsHeader,
     adm_accounts admin
where section.id = groupsBody.id_pbi_workspaces_reports_sections
  and groupsBody.id_pbi_reports_groups_headers = groupsHeader.id
  and groupsHeader.id_adm_accounts = admin.id
  and admin.id = ?

  and section.id not in (select section.id
                         from pbi_workspaces_reports_sections section,
                              pbi_reports_groups_body groupsBody,
                              pbi_reports_groups_headers groupsHeader,
                              adm_users_reports_groups usersReportsGroups,
                              adm_users user
                         where section.id = groupsBody.id_pbi_workspaces_reports_sections
                           and groupsBody.id_pbi_reports_groups_headers = groupsHeader.id
                           and usersReportsGroups.id_pbi_reports_groups_headers = groupsHeader.id
                           and usersReportsGroups.id_adm_users = user.id
                           and user.id in ?

                         union

                         select section.id
                         from pbi_workspaces_reports_sections section,
                              pbi_reports_groups_body groupsBody,
                              pbi_reports_groups_headers groupsHeader
                         where section.id = groupsBody.id_pbi_workspaces_reports_sections
                           and groupsBody.id_pbi_reports_groups_headers = groupsHeader.id
                           and groupsHeader.id in ?
      )
`;

exports.CREATE_USERS_GROUP = `
insert into adm_users_groups (code, name, active)
values (?, ?, ?)
`;

exports.ADD_USERS_TO_USERS_GROUP = `
insert into adm_users_groups_has_users (id_adm_users_groups, id_adm_users_id)
values ?
`;

exports.ADD_REPORTS_GROUPS_TO_USERS_GROUP = `
insert into adm_users_groups_has_reports_groups_headers (id_adm_users_groups, id_pbi_reports_groups_headers)
values ?
`;

exports.ADD_SECTIONS_TO_USERS_GROUP = `
insert into adm_users_groups_has_workspaces_reports_sections (id_adm_users_groups, id_pbi_workspaces_reports_sections)
values ?
`;

exports.DELETE_USERS_FROM_USERS_GROUP = `
delete from adm_users_groups_has_users
where id_adm_users_groups = ?
`;

exports.DELETE_REPORTS_GROUPS_FROM_USERS_GROUP = `
delete from adm_users_groups_has_reports_groups_headers
where id_adm_users_groups = ?
`;

exports.DELETE_SECTIONS_FROM_USERS_GROUP = `
delete from adm_users_groups_has_workspaces_reports_sections
where id_adm_users_groups = ?
`;

exports.UPDATE_USERS_GROUP = `
update adm_users_groups
set code = ?, name = ?, active = ?
where id = ?;
`;
