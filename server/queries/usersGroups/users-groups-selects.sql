-- READ_USERS_GROUPS
select usersGroup.id,
       code,
       usersGroup.name,
       usersGroup.active,
       count(user.id)   as numUsers
from adm_users_groups usersGroup,
     adm_users_groups_has_users usersGroupsHasUser,
     adm_users user,
     adm_accounts admin
where usersGroup.id = usersGroupsHasUser.id_adm_users_groups
  and usersGroupsHasUser.id_adm_users_id = user.id
  and user.id_adm_accounts = admin.id

  and admin.id = 1
group by usersGroup.id;


-- cuenta usuarios en users groups
select count(*)
from adm_users_groups usersGroup,
     adm_users_groups_has_users hasUsers,
     adm_users user
where hasUsers.id_adm_users_groups = usersGroup.id
and hasUsers.id_adm_users_id = user.id
and usersGroup.id = 1;


-- READ_USERS_GROUPS_USERS
select user.id, usersGroup.id
from adm_users_groups usersGroup,
     adm_users_groups_has_users usersGroupsHasUser,
     adm_users user,
     adm_accounts admin
where usersGroup.id = usersGroupsHasUser.id_adm_users_groups
  and usersGroupsHasUser.id_adm_users_id = user.id
  and user.id_adm_accounts = admin.id

  and admin.id = 1;

-- READ_USERS_GROUPS_REPORTS_GROUPS
select groupsHeader.id
from adm_users_groups usersGroup,
     adm_users_groups_has_reports_groups_headers usersGroupsHasReportsGroup,
     pbi_reports_groups_headers groupsHeader,
     adm_accounts admin
where usersGroup.id = usersGroupsHasReportsGroup.id_adm_users_groups
  and usersGroupsHasReportsGroup.id_pbi_reports_groups_headers = groupsHeader.id
  and groupsHeader.id_adm_accounts = admin.id

  and admin.id = 1
  and usersGroup.id = 1;

select *
from pbi_workspaces_reports_sections;

select section.id,
       report.id_pbi                     as reportIdPBI,
       section.id_pbi_workspaces_reports as reportId,
       section.id_pbi                    as pbiSectionId,
       section.name,
       report.name                       as reportName,
       workspace.name                    as workspaceName,
       report.active                     as reportActive

from adm_accounts admin,
     adm_accounts_reports accountsReport,
     pbi_workspaces_reports report,
     pbi_workspaces_reports_sections section,
     pbi_workspaces workspace

where admin.id = accountsReport.id_adm_accounts
  and report.id = accountsReport.id_pbi_workspaces_reports
  and report.id = section.id_pbi_workspaces_reports
  and report.id_pbi_workspaces = workspace.id
  and admin.id = ?;

select * from adm_users_groups;

select * from adm_users_groups_has_users;

select * from adm_users_groups_has_workspaces_reports_sections;

delete adm_users_groups_has_workspaces_reports_sections
where id_adm_users_groups = ?
