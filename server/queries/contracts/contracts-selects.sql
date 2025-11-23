select *
from adm_account_contract;

select name, address, created_at, updated_at
from adm_account_contract
where id_adm_accounts = 1;

select c.name,
       address,
       created_at,
       updated_at,
       id_int_id_type as identificationDocumentId,
       int_id_type_value identificationDocumentValue,
       gz.id          as zoneId,
       gr.id          as regionId,
       gc.id          as countryId,
       mo.id          as moneyId
from adm_account_contract c,
     geo_zone gz,
     geo_region gr,
     geo_countries gc,
     int_id_type id_doc,
     adm_money mo
where gz.id = c.id_geo_zone
  and gr.id = gz.id_geo_region
  and gc.id = gr.id_geo_countries
  and gc.id = id_doc.id_int_countries
  and mo.id = id_doc.id_adm_money
  and id_adm_accounts = 1;

create procedure sp_contract_details_by_admin(in contract_id int, in admin_id int)
begin
    select *
    from adm_account_contract_detail;

    select detail.id, quantity, name, cost.standard_cost as cost
    from adm_account_contract_detail detail,
         int_items item,
         adm_items_standard_costs cost
    where item.id = detail.id_int_items
      and item.id = cost.id_int_items
      and active = 1
      and cost.down_date = (select max(down_date) from adm_items_standard_costs sc where sc.id_int_items = item.id)
      and detail.id_adm_account_contract = contract_id

    union

    select uuid(), count(admin.id), 'Usuarios', 1 as cost
    from adm_users user,
         adm_accounts admin
    where user.id_adm_accounts = admin.id
      and user.active = 1
      and admin.id = admin_id
    group by admin.id

    union

    select uuid(), count(admin.id), 'Reportes', 1 as cost
    from adm_accounts admin,
         adm_accounts_reports accountsReport
    where accountsReport.id_adm_accounts = admin.id
      and accountsReport.active = 1
      and admin.id = admin_id
    group by admin.id

    union

    select uuid(), count(distinct workspace.id), 'Workspaces', 1 as cost
    from adm_accounts admin,
         adm_accounts_reports accountsReport,
         pbi_workspaces_reports report,
         pbi_workspaces workspace
    where accountsReport.id_adm_accounts = admin.id
      and accountsReport.active = 1
      and accountsReport.id_pbi_workspaces_reports = report.id
      and report.active = 1
      and report.id_pbi_workspaces = workspace.id
      and admin.id = admin_id;
end;

call sp_contract_details_by_admin(1, 1);
