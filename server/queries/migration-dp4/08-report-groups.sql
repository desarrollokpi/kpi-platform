delimiter $$

create function fn_get_id_adm_account_reports_by_section_id(section_id int)
    returns int
begin
    declare id_adm_account_reports int;

    select ar.id
    into id_adm_account_reports
    from pbi_workspaces_reports_sections s,
         pbi_workspaces_reports wr,
         adm_accounts_reports ar
    where wr.id = s.id_pbi_workspaces_reports
      and wr.id = ar.id_pbi_workspaces_reports
      and s.id = section_id;

    return id_adm_account_reports;
end $$

delimiter ;