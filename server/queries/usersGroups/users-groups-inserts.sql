insert into adm_users_groups (code, name)
values ('UG01', 'Grupo Alpha'),
       ('UG02', 'Grupo Legends'),
       ('Ug03', 'Grupo Xpress');

-- -- ----------------------------
-- Asociación con los usuarios
-- ----------------------------
insert into adm_users_groups_has_users (id_adm_users_groups, id_adm_users_id)
values (1, 1),
       (1, 2),
       (1, 3),
       (2, 5),
       (2, 7),
       (2, 8),
       (2, 16),
       (3, 9),
       (3, 1),
       (3, 8);

select *
from adm_users_groups_has_users;

-- ---------------------------------
-- Asociación con grupos de reporte
-- ---------------------------------

-- query que encuentra los grupos de reporte de un administrador
select *
from pbi_reports_groups_headers groupsHeader,
     adm_accounts admin
where groupsHeader.id_adm_accounts = admin.id
  and admin.id = 1;

insert into adm_users_groups_has_reports_groups_headers (id_adm_users_groups, id_pbi_reports_groups_headers)
values (1, 2),
       (1, 3),
       (1, 8),
       (2, 14),
       (1, 15),
       (3, 7),
       (3, 8),
       (3, 11),
       (3, 12);

insert into adm_users_groups_has_reports_groups_headers (id_adm_users_groups, id_pbi_reports_groups_headers)
values (2, 15);

-- ---------------------------------
-- Asociación con secciones
-- ---------------------------------

-- secciones asociadas al grupo de usuarios
select section.id
from adm_users_groups usersGroup,
     adm_users_groups_has_workspaces_reports_sections usersGroupHasSection,
     pbi_workspaces_reports_sections section,
     pbi_reports_groups_body groupsBody,
     pbi_reports_groups_headers groupsHeader,
     adm_accounts admin
where usersGroup.id = usersGroupHasSection.id_adm_users_groups
  and usersGroupHasSection.id_pbi_workspaces_reports_sections = section.id
  and groupsBody.id_pbi_workspaces_reports_sections = section.id
  and groupsBody.id_pbi_reports_groups_headers = groupsHeader.id
  and groupsHeader.id_adm_accounts = admin.id

  and admin.id = ?
  and usersGroup.id = ?;

select * from pbi_reports_groups_body;

-- selecciona las secciones asociadas al admin

create procedure get_independent_sections_ids(
    in admin_id int, in users_group_id int
)
begin
    select section.id
    from pbi_workspaces_reports_sections section,
         pbi_workspaces_reports report,
         adm_accounts_reports accountReport,
         adm_accounts admin
    where section.id_pbi_workspaces_reports = report.id
      and report.id = accountReport.id
      and accountReport.id_adm_accounts = admin.id
      and section.id not in (select distinct section.id
                             from adm_users_groups userGroup,
                                  adm_users_groups_has_reports_groups_headers usersGroupHasReportsGroup,
                                  pbi_reports_groups_headers groupsHeader,
                                  pbi_reports_groups_body groupsBody,
                                  pbi_workspaces_reports_sections section,
                                  adm_accounts admin
                             where usersGroupHasReportsGroup.id_adm_users_groups = userGroup.id
                               and usersGroupHasReportsGroup.id_pbi_reports_groups_headers = groupsHeader.id
                               and groupsBody.id_pbi_reports_groups_headers = groupsHeader.id
                               and groupsBody.id_pbi_workspaces_reports_sections = section.id
                               and groupsHeader.id_adm_accounts = admin.id

                               and userGroup.id = users_group_id
                               and admin.id = admin_id)

      and section.id not in (select distinct section.id
                             from adm_users_groups usersGroup,
                                  adm_users_groups_has_users usersGroupHasUser,
                                  adm_users user,
                                  adm_accounts admin,
                                  adm_users_reports_groups usersReportsGroup,
                                  pbi_reports_groups_headers groupsHeader,
                                  pbi_reports_groups_body groupsBody,
                                  pbi_workspaces_reports_sections section
                             where usersGroup.id = usersGroupHasUser.id_adm_users_groups
                               and usersGroupHasUser.id_adm_users_id = user.id
                               and user.id_adm_accounts = admin.id
                               and usersReportsGroup.id_adm_users = user.id
                               and usersReportsGroup.id_pbi_reports_groups_headers = groupsHeader.id
                               and groupsBody.id_pbi_reports_groups_headers = groupsHeader.id
                               and groupsBody.id_pbi_workspaces_reports_sections = section.id

                               and usersGroup.id = users_group_id
                               and admin.id = admin_id)

      and admin.id = admin_id;
end;

call get_independent_sections_ids(1, 1);

-- todas las secciones del admin
select section.id
from pbi_workspaces_reports_sections section,
     pbi_workspaces_reports report,
     adm_accounts_reports accountReport,
     adm_accounts admin
where section.id_pbi_workspaces_reports = report.id
  and report.id = accountReport.id
  and accountReport.id_adm_accounts = admin.id

  and admin.id = 1;

select *
from adm_users_groups;

-- secciones asociadas al grupo de usuarios por medio de grupo de reportes
select distinct section.id
from adm_users_groups userGroup,
     adm_users_groups_has_reports_groups_headers usersGroupHasReportsGroup,
     pbi_reports_groups_headers groupsHeader,
     pbi_reports_groups_body groupsBody,
     pbi_workspaces_reports_sections section,
     adm_accounts admin
where usersGroupHasReportsGroup.id_adm_users_groups = userGroup.id
  and usersGroupHasReportsGroup.id_pbi_reports_groups_headers = groupsHeader.id
  and groupsBody.id_pbi_reports_groups_headers = groupsHeader.id
  and groupsBody.id_pbi_workspaces_reports_sections = section.id
  and groupsHeader.id_adm_accounts = admin.id

  and userGroup.id = 1
  and admin.id = 1;

-- secciones asociadas al grupo de usuarios por medio de grupos de reportes asociados al usuario
select distinct section.id
from adm_users_groups usersGroup,
     adm_users_groups_has_users usersGroupHasUser,
     adm_users user,
     adm_accounts admin,
     adm_users_reports_groups usersReportsGroup,
     pbi_reports_groups_headers groupsHeader,
     pbi_reports_groups_body groupsBody,
     pbi_workspaces_reports_sections section
where usersGroup.id = usersGroupHasUser.id_adm_users_groups
  and usersGroupHasUser.id_adm_users_id = user.id
  and user.id_adm_accounts = admin.id
  and usersReportsGroup.id_adm_users = user.id
  and usersReportsGroup.id_pbi_reports_groups_headers = groupsHeader.id
  and groupsBody.id_pbi_reports_groups_headers = groupsHeader.id
  and groupsBody.id_pbi_workspaces_reports_sections = section.id

  and usersGroup.id = 1
  and admin.id = 1;


-- asocia grupos de usuarios a secciones
insert into adm_users_groups_has_workspaces_reports_sections (id_adm_users_groups, id_pbi_workspaces_reports_sections)
values (1, 7),
       (1, 18),
       (2, 7);

select *
from adm_users_groups_has_users
where id_adm_users_groups = 1;

select * from adm_users_groups;

select * from adm_users_groups_has_users;

