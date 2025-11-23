select * from adm_terms_and_conditions
order by created_at desc
limit 1;

select tac.id
from adm_accounts_has_adm_terms_and_conditions accepted, adm_accounts admin, adm_terms_and_conditions tac
where admin.id = accepted.id_adm_accounts and tac.id = accepted.id_adm_terms_and_conditions
and admin.id = 1;

select * from adm_accounts_has_adm_terms_and_conditions;