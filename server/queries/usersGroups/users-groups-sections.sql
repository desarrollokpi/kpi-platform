-- La operación completa es
-- all(sections) - (users.sections U reportsGroups.sections)

-- (1/3) Todas las secciones del admin
select distinct section.id
from pbi_workspaces_reports_sections section,
     pbi_reports_groups_body groupsBody,
     pbi_reports_groups_headers groupsHeader,
     adm_accounts admin
where section.id = groupsBody.id_pbi_workspaces_reports_sections
  and groupsBody.id_pbi_reports_groups_headers = groupsHeader.id
  and groupsHeader.id_adm_accounts = admin.id
  and admin.id = 1;

-- (2/3) Todas las secciones de los usuaurios
select section.id
from pbi_workspaces_reports_sections section,
     pbi_reports_groups_body groupsBody,
     pbi_reports_groups_headers groupsHeader,
     adm_users_reports_groups usersReportsGroups,
     adm_users user
where section.id = groupsBody.id_pbi_workspaces_reports_sections
  and groupsBody.id_pbi_reports_groups_headers = groupsHeader.id
  and usersReportsGroups.id_pbi_reports_groups_headers = groupsHeader.id
  and usersReportsGroups.id_adm_users = user.id
  and user.id in (2);

-- (3/3) Todas las secciones asociadas a grupos de reporte
select *
from pbi_workspaces_reports_sections section,
     pbi_reports_groups_body groupsBody,
     pbi_reports_groups_headers groupsHeader
where section.id = groupsBody.id_pbi_workspaces_reports_sections
  and groupsBody.id_pbi_reports_groups_headers = groupsHeader.id
  and groupsHeader.id in (3, 2);

-- Ahora la operación commpleta
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
                           and user.id in (?)

                         union

                         select section.id
                         from pbi_workspaces_reports_sections section,
                              pbi_reports_groups_body groupsBody,
                              pbi_reports_groups_headers groupsHeader
                         where section.id = groupsBody.id_pbi_workspaces_reports_sections
                           and groupsBody.id_pbi_reports_groups_headers = groupsHeader.id
                           and groupsHeader.id in (?)
      )





