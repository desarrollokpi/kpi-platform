select * from adm_users_reports_groups;
select * from adm_users;
select * from adm_accounts_reports;
select * from adm_accounts;

select * from pbi_reports_groups_headers;
select * from pbi_reports_groups_body;
select * from pbi_workspaces_reports;

-- accordion contents
select u.id as userId, gh.code,  gh.name, count(gb.id), wr.active

from pbi_reports_groups_headers gh, adm_users u, adm_accounts a, adm_users_reports_groups rp,
        pbi_reports_groups_body gb, pbi_workspaces_reports_sections rs,
     pbi_workspaces_reports wr, pbi_workspaces w

where a.id = u.id_adm_accounts and u.id = rp.id_adm_users and rp.id_pbi_reports_groups_headers = gh.id
  and gh.id = gb.id_pbi_reports_groups_headers
  and rs.id = gb.id_pbi_workspaces_reports_sections and wr.id = rs.id_pbi_workspaces_reports
  and w.id = wr.id_pbi_workspaces

and a.id = 1
group by u.id, gh.id, wr.active;

-- leer reportGroups por userId
select id_adm_users as userId, id_pbi_reports_groups_headers as reportGroupId
from adm_users_reports_groups rp, adm_users u, adm_accounts a
where a.id = u.id_adm_accounts
and a.id = 1
group by rp.id_adm_users, rp.id_pbi_reports_groups_headers;

-- create user
insert into adm_users (id_adm_accounts, username, name, mail, password, active)
values (1, 'datagrip', 'Data Grip', 'datagrip@gmail.com', 1234, 1);

-- connect user to report groups
insert into adm_users_reports_groups (id_adm_users, id_pbi_reports_groups_headers)
values (9, 2);

-- delete user-reportGroups connection
delete from adm_users_reports_groups
where id_adm_users = 2;

-- update user
update adm_users
set id_adm_accounts = 1, username = 'datagrip-mod', name = 'Data Grip',
    mail = 'datagrip@gmail.com', password = 1234, active = 1
where id = 9;

-- delete a user
delete from adm_users
where id = 10;