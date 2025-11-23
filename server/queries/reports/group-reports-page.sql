select *
from adm_users_reports_groups;
select *
from adm_users;
select *
from adm_accounts_reports;
select *
from adm_accounts;

select *
from pbi_reports_groups_headers;
select *
from pbi_reports_groups_body;
select *
from pbi_workspaces_reports;
select *
from pbi_workspaces;
select *
from pbi_workspaces_reports_sections;

-- groupos de reportes page (accordion headers)
select gh.id, code, gh.name, count(code) as sections, gh.active
from pbi_reports_groups_headers gh,
     adm_accounts a,
     pbi_reports_groups_body gb
where a.id = gh.id_adm_accounts
  and gh.id = gb.id_pbi_reports_groups_headers
  and a.id = 1
group by code, gh.id;

-- grupos de reportes page (contenido de accordion)
select *
-- select gb.id, gh.id as reportGroupId, code, w.name as workspace, w.id_pbi as workspaceId, wr.name as report, rs.name as section, wr.active
from pbi_reports_groups_headers gh,
     adm_accounts a,
     pbi_reports_groups_body gb,
     pbi_workspaces_reports_sections rs,
     pbi_workspaces_reports wr,
     pbi_workspaces w
where a.id = gh.id_adm_accounts
  and gh.id = gb.id_pbi_reports_groups_headers
  and rs.id = gb.id_pbi_workspaces_reports_sections
  and wr.id = rs.id_pbi_workspaces_reports
  and w.id = wr.id_pbi_workspaces

  and a.id = 1;

-- READ admin account / reportes
select wr.id, w.name as workspace, wr.name as name, wr.active, w.id_pbi as groupId, wr.id_pbi as reportId
from pbi_reports_groups_headers gh,
     adm_accounts a,
     pbi_reports_groups_body gb,
     pbi_workspaces_reports_sections rs,
     pbi_workspaces_reports wr,
     pbi_workspaces w
where a.id = gh.id_adm_accounts
  and gh.id = gb.id_pbi_reports_groups_headers
  and rs.id = gb.id_pbi_workspaces_reports_sections
  and wr.id = rs.id_pbi_workspaces_reports
  and w.id = wr.id_pbi_workspaces

  and a.id = 1
group by wr.id;

-- UPDATE (active) admin account / reportes
update pbi_workspaces_reports
set active = 1
where id = 6;

select wr.id,
       gb.id     as reportGroupBodyId,
       gh.id     as reportGroupId,
       code,
       w.name    as workspace,
       w.id_pbi  as groupIdPBI,
       wr.name   as name,
       wr.id_pbi as reportIdPBI,
       rs.name   as section,
       wr.active
from pbi_reports_groups_headers gh,
     adm_accounts a,
     pbi_reports_groups_body gb,
     pbi_workspaces_reports_sections rs,
     pbi_workspaces_reports wr,
     pbi_workspaces w
where a.id = gh.id_adm_accounts
  and gh.id = gb.id_pbi_reports_groups_headers
  and rs.id = gb.id_pbi_workspaces_reports_sections
  and wr.id = rs.id_pbi_workspaces_reports
  and w.id = wr.id_pbi_workspaces

  and a.id = 1;

select table_schema as database_name,
       table_name,
       update_time
from information_schema.tables tab
where update_time > (current_timestamp() - interval 30 day)
  and table_type = 'BASE TABLE'
  and table_schema not in ('information_schema', 'sys',
                           'performance_schema', 'mysql')
  -- and table_schema = 'your database name'
order by update_time desc;

select *
from pbi_reports_groups_body
order by id desc;

select *
from pbi_reports_groups_headers;

delete from pbi_reports_groups_headers
where id = 9;

select * from pbi_reports_groups_body
where id_pbi_reports_groups_headers = 9;

update pbi_reports_groups_headers
set code   = ?,
    name   = ?,
    active = ?
where id = ?;

insert into pbi_reports_groups_body (id_pbi_reports_groups_headers, id_pbi_workspaces_reports_sections,
                                     id_adm_accounts_reports)
values (2, 17, fn_get_id_adm_account_reports_by_section_id(17)),
       (2, 9, fn_get_id_adm_account_reports_by_section_id(9)),
       (2, 20, fn_get_id_adm_account_reports_by_section_id(20));

-- no borrar
alter table pbi_reports_groups_body
    drop foreign key fk__pbi_reports_groups_body__pbi_reports_groups_header;

alter table pbi_reports_groups_body
    add constraint fk__pbi_reports_groups_body__pbi_reports_groups_header foreign key (id_pbi_reports_groups_headers) references pbi_reports_groups_headers (id) on delete cascade;
-- despues de aqui si puedes borrar

select *
from adm_accounts a, adm_users u, adm_users_reports_groups rp
where u.id_adm_accounts = a.id
and u.id = rp.id_adm_users
and a.id = 1
and u.id = 8
order by a.id;

insert into adm_users_reports_groups (id_adm_users, id_pbi_reports_groups_headers)
values (2, 2), (2, 11), (2, 8);