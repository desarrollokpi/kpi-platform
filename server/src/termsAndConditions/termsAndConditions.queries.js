exports.READ_TERMS_AND_CONDITIONS = `
select * from adm_terms_and_conditions
order by created_at desc
limit 1;
`
